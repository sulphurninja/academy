/**
 * Thin OpenAI wrapper for ZapAcademy.
 *
 * - Defaults to the cheapest production model (gpt-4o-mini).
 * - Every call deducts AI credits from the customer's wallet on success.
 * - Failures and quota errors do NOT charge.
 * - All operations log a `WalletTransaction` row for the audit trail.
 *
 * Add new AI features by writing a new helper that calls `chatJson()` or
 * `chatText()` and supplies a `companyId`. That's it.
 */

import OpenAI from "openai";
import {
  AI_MODEL,
  type AIModel,
  calculateCredits,
  deductAiCredits,
} from "./ai-credits";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  _client = new OpenAI({ apiKey });
  return _client;
}

export interface AiResult<T> {
  data?: T;
  /** Why the call did not produce data (insufficient credits, parse fail, etc). */
  error?: string;
  creditsCharged: number;
  balanceAfter?: number;
}

/**
 * One-shot text completion. Returns string content or an error.
 * Usage is metered + deducted from `companyId`.
 */
export async function chatText(opts: {
  companyId: string;
  description: string; // for the wallet transaction audit
  systemPrompt: string;
  userPrompt: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}): Promise<AiResult<string>> {
  const {
    companyId,
    description,
    systemPrompt,
    userPrompt,
    model = AI_MODEL,
    temperature = 0.4,
    maxTokens = 600,
    metadata,
  } = opts;

  let resp: any;
  try {
    resp = await client().chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
  } catch (err: any) {
    return {
      error: err?.message || "OpenAI request failed",
      creditsCharged: 0,
    };
  }

  const text = resp?.choices?.[0]?.message?.content?.trim() || "";
  const inputTokens = resp?.usage?.prompt_tokens ?? Math.ceil(userPrompt.length / 4);
  const outputTokens = resp?.usage?.completion_tokens ?? Math.ceil(text.length / 4);
  const credits = calculateCredits(inputTokens, outputTokens, model);

  const dr = await deductAiCredits(companyId, credits, description, {
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    ...metadata,
  });
  if (!dr.success) {
    // We already paid OpenAI but couldn't deduct internally — surface to caller.
    return {
      data: text,
      error: dr.error,
      creditsCharged: 0,
      balanceAfter: dr.balance,
    };
  }

  return { data: text, creditsCharged: credits, balanceAfter: dr.balance };
}

/**
 * JSON-mode completion. Returns parsed JSON or an error string.
 */
export async function chatJson<T = unknown>(opts: {
  companyId: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}): Promise<AiResult<T>> {
  const {
    companyId,
    description,
    systemPrompt,
    userPrompt,
    model = AI_MODEL,
    temperature = 0.2,
    maxTokens = 700,
    metadata,
  } = opts;

  let resp: any;
  try {
    resp = await client().chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
  } catch (err: any) {
    return {
      error: err?.message || "OpenAI request failed",
      creditsCharged: 0,
    };
  }

  const text = resp?.choices?.[0]?.message?.content?.trim() || "";
  const inputTokens = resp?.usage?.prompt_tokens ?? Math.ceil(userPrompt.length / 4);
  const outputTokens = resp?.usage?.completion_tokens ?? Math.ceil(text.length / 4);
  const credits = calculateCredits(inputTokens, outputTokens, model);

  let parsed: T | undefined;
  try {
    parsed = text ? (JSON.parse(text) as T) : undefined;
  } catch {
    return {
      error: "AI response was not valid JSON",
      creditsCharged: 0,
    };
  }

  const dr = await deductAiCredits(companyId, credits, description, {
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    ...metadata,
  });

  if (!dr.success) {
    return {
      data: parsed,
      error: dr.error,
      creditsCharged: 0,
      balanceAfter: dr.balance,
    };
  }

  return { data: parsed, creditsCharged: credits, balanceAfter: dr.balance };
}
