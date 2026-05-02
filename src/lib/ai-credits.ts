/**
 * AI Credits service — mirrors the main Zaptick app exactly.
 * Atomic deduct on `Company.aiCredits`, append a debit row to WalletTransaction,
 * never let the balance go negative.
 *
 * Same credit pricing curve as the main app so a customer's AI credit wallet
 * is one unified balance across Zaptick + ZapAcademy.
 */

import dbConnect from "./db";
import Company from "@/models/Company";
import WalletTransaction from "@/models/WalletTransaction";
import mongoose from "mongoose";

/**
 * Cheapest model in production — gpt-4o-mini.
 *
 * AI credits per 1K tokens (matches main app's `AI_CREDITS_PER_1K_TOKENS`).
 *  - input: 0.01 credits
 *  - output: 0.05 credits
 * A typical 600-token suggestion call costs ~0.012 credits. Effectively free,
 * but every call is logged so customers can see usage and we never silently
 * eat compute.
 */
export const AI_MODEL = "gpt-4o-mini" as const;
export type AIModel = typeof AI_MODEL;

const CREDITS_PER_1K_TOKENS: Record<AIModel, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.01, output: 0.05 },
};

export function calculateCredits(
  inputTokens: number,
  outputTokens: number,
  model: AIModel = AI_MODEL
): number {
  const p = CREDITS_PER_1K_TOKENS[model];
  return (inputTokens / 1000) * p.input + (outputTokens / 1000) * p.output;
}

export interface DeductResult {
  success: boolean;
  balance?: number;
  error?: string;
  creditsCharged?: number;
}

export async function deductAiCredits(
  companyId: string | mongoose.Types.ObjectId,
  credits: number,
  description: string,
  metadata?: Record<string, any>
): Promise<DeductResult> {
  await dbConnect();

  if (credits <= 0) {
    return { success: true, balance: undefined, creditsCharged: 0 };
  }

  // Atomic deduction — only succeeds if balance >= credits
  const updated = await Company.findOneAndUpdate(
    { _id: companyId, aiCredits: { $gte: credits } },
    { $inc: { aiCredits: -credits } },
    { new: true }
  );

  if (!updated) {
    const company = await Company.findById(companyId).select("aiCredits").lean<{
      aiCredits?: number;
    }>();
    const current = company?.aiCredits ?? 0;
    return {
      success: false,
      balance: Math.max(0, current),
      error: `Insufficient AI Credits. Available: ${Math.max(0, current).toFixed(
        4
      )}, Required: ${credits.toFixed(4)}`,
    };
  }

  const balanceAfter = (updated.aiCredits as number) ?? 0;
  const balanceBefore = balanceAfter + credits;

  await WalletTransaction.create({
    companyId: updated._id,
    amount: credits,
    type: "debit",
    status: "completed",
    description: `[AI Credits] ${description}`,
    reference: new mongoose.Types.ObjectId().toString(),
    referenceType: "ai_generation",
    metadata: {
      ...metadata,
      isAiCredits: true,
      balanceBefore,
      balanceAfter,
      currency: "AI_CREDITS",
      app: "zapacademy",
    },
  });

  return { success: true, balance: balanceAfter, creditsCharged: credits };
}

export async function getAiCreditsBalance(
  companyId: string | mongoose.Types.ObjectId
): Promise<number> {
  await dbConnect();
  const c = await Company.findById(companyId).select("aiCredits").lean<{
    aiCredits?: number;
  }>();
  return Math.max(0, c?.aiCredits ?? 0);
}
