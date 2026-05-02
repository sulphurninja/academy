/**
 * Server-side gamification engine.
 *
 * Every XP-granting action passes through `awardXp()`. It writes the ledger row,
 * recomputes total XP, ticks the streak if needed, and triggers any newly earned
 * badges. Idempotency is the caller's responsibility (e.g. /quiz/submit checks
 * `quizPassedAt` before awarding).
 */

import mongoose from "mongoose";
import dbConnect from "./db";
import XpEvent from "@/models/XpEvent";
import BadgeEarned from "@/models/BadgeEarned";
import Streak from "@/models/Streak";
import Progress from "@/models/Progress";
import LevelReward from "@/models/LevelReward";
import Company from "@/models/Company";
import WalletTransaction from "@/models/WalletTransaction";
import User from "@/models/User";
import { BADGES } from "./badges";
import { CURRICULUM, totalLessons } from "./curriculum";
import { levelFromXp, LEVEL_CREDIT_REWARDS } from "./xp";

export interface AwardResult {
  amountAwarded: number;
  newTotalXp: number;
  newBadges: string[];
}

/** Sum total XP for a user from the ledger. */
export async function getTotalXp(userId: mongoose.Types.ObjectId | string): Promise<number> {
  await dbConnect();
  const result = await XpEvent.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
}

export async function awardXp(params: {
  userId: mongoose.Types.ObjectId | string;
  amount: number;
  kind: string;
  weekSlug?: string;
  lessonSlug?: string;
  meta?: Record<string, any>;
}): Promise<AwardResult> {
  await dbConnect();
  const uid = new mongoose.Types.ObjectId(params.userId.toString());

  if (params.amount > 0) {
    await XpEvent.create({
      userId: uid,
      amount: params.amount,
      kind: params.kind,
      weekSlug: params.weekSlug,
      lessonSlug: params.lessonSlug,
      meta: params.meta,
    });
  }

  const newTotal = await getTotalXp(uid);

  // Recompute & award any newly-earned badges.
  const newBadges = await checkAndAwardBadges(uid);

  // Auto-credit wallet + AI credits for any new levels reached.
  await creditLevelRewards(uid, newTotal);

  return {
    amountAwarded: params.amount,
    newTotalXp: newTotal,
    newBadges,
  };
}

/** Increment / reset the streak based on today vs last active day (UTC). */
export async function tickStreak(
  userId: mongoose.Types.ObjectId | string
): Promise<{ current: number; longest: number; gainedDay: boolean }> {
  await dbConnect();
  const uid = new mongoose.Types.ObjectId(userId.toString());

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let s = await Streak.findOne({ userId: uid });
  if (!s) {
    s = await Streak.create({ userId: uid, current: 1, longest: 1, lastActiveDay: today });
    return { current: 1, longest: 1, gainedDay: true };
  }

  if (s.lastActiveDay === today) {
    return { current: s.current, longest: s.longest, gainedDay: false };
  }

  if (s.lastActiveDay === yesterday) {
    s.current += 1;
  } else {
    s.current = 1;
  }
  s.longest = Math.max(s.longest, s.current);
  s.lastActiveDay = today;
  await s.save();

  return { current: s.current, longest: s.longest, gainedDay: true };
}

async function getEarnedBadgeIds(uid: mongoose.Types.ObjectId): Promise<Set<string>> {
  const rows = await BadgeEarned.find({ userId: uid }).select("badgeId").lean();
  return new Set(rows.map((r) => r.badgeId));
}

async function grantBadge(
  uid: mongoose.Types.ObjectId,
  badgeId: string,
  meta?: Record<string, any>
): Promise<boolean> {
  try {
    await BadgeEarned.create({ userId: uid, badgeId, earnedAt: new Date(), meta });
    return true;
  } catch (err: any) {
    // duplicate key — already earned
    if (err?.code === 11000) return false;
    throw err;
  }
}

/**
 * Inspect the user's current state and award any badges they newly qualify for.
 * Returns the badgeIds that were just granted.
 */
export async function checkAndAwardBadges(
  userId: mongoose.Types.ObjectId | string
): Promise<string[]> {
  await dbConnect();
  const uid = new mongoose.Types.ObjectId(userId.toString());
  const earned = await getEarnedBadgeIds(uid);
  const granted: string[] = [];

  // Snapshot user state
  const [progressRows, attempts, streak] = await Promise.all([
    Progress.find({ userId: uid }).lean(),
    XpEvent.find({ userId: uid, kind: { $in: ["quizPass", "quizPassFirstTry"] } })
      .select("kind weekSlug lessonSlug")
      .lean(),
    Streak.findOne({ userId: uid }).lean(),
  ]);

  // first_blood — any video completed
  if (!earned.has("first_blood") && progressRows.some((p) => p.videoCompletedAt)) {
    if (await grantBadge(uid, "first_blood")) granted.push("first_blood");
  }

  // quiz_master_5
  const passes = progressRows.filter((p) => p.quizPassedAt).length;
  if (!earned.has("quiz_master_5") && passes >= 5) {
    if (await grantBadge(uid, "quiz_master_5")) granted.push("quiz_master_5");
  }

  // perfect_score — any perfect first-try quiz
  if (!earned.has("perfect_score")) {
    const anyPerfect = progressRows.some(
      (p) => p.quizPerfectAt && p.quizAttempts === 1
    );
    if (anyPerfect && (await grantBadge(uid, "perfect_score"))) granted.push("perfect_score");
  }

  // streaks
  if (streak) {
    if (!earned.has("streak_7") && streak.current >= 7) {
      if (await grantBadge(uid, "streak_7")) granted.push("streak_7");
    }
    if (!earned.has("streak_30") && streak.current >= 30) {
      if (await grantBadge(uid, "streak_30")) granted.push("streak_30");
    }
  }

  // week_finisher — any week where all lessons have quizPassedAt
  if (!earned.has("week_finisher")) {
    for (const w of CURRICULUM) {
      const lessonSlugs = w.lessons.map((l) => l.slug);
      const passedInWeek = progressRows.filter(
        (p) =>
          p.weekSlug === w.slug && p.quizPassedAt && lessonSlugs.includes(p.lessonSlug)
      ).length;
      if (lessonSlugs.length > 0 && passedInWeek >= lessonSlugs.length) {
        if (await grantBadge(uid, "week_finisher", { weekSlug: w.slug })) {
          granted.push("week_finisher");
        }
        break;
      }
    }
  }

  // graduated — finished all lessons in all weeks
  if (!earned.has("graduated")) {
    const totalPassed = progressRows.filter((p) => p.quizPassedAt).length;
    if (totalPassed >= totalLessons()) {
      if (await grantBadge(uid, "graduated")) granted.push("graduated");
    }
  }

  // Reference for unused vars
  void attempts;

  return granted;
}

/** Build a leaderboard from the XP ledger. */
export async function getLeaderboard(
  limit = 25,
  cohortFilter?: { sinceDate?: Date }
): Promise<
  { userId: string; name: string; email: string; xp: number; rank: number }[]
> {
  await dbConnect();

  const match: any = {};
  if (cohortFilter?.sinceDate) match.createdAt = { $gte: cohortFilter.sinceDate };

  const rows = await XpEvent.aggregate([
    Object.keys(match).length ? { $match: match } : { $match: {} },
    { $group: { _id: "$userId", xp: { $sum: "$amount" } } },
    { $sort: { xp: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "u",
      },
    },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        xp: 1,
        name: { $ifNull: ["$u.name", "Unknown"] },
        email: { $ifNull: ["$u.email", ""] },
      },
    },
  ]);

  return rows.map((r: any, i: number) => ({
    userId: r.userId.toString(),
    name: r.name,
    email: r.email,
    xp: r.xp,
    rank: i + 1,
  }));
}

/**
 * When a user crosses into a new level, auto-deposit the level's
 * AI credits and wallet credits into their Zaptick company account.
 * Uses LevelReward for idempotency — each (userId, level) pair is
 * credited exactly once.
 */
async function creditLevelRewards(
  uid: mongoose.Types.ObjectId,
  totalXp: number
): Promise<void> {
  const { level } = levelFromXp(totalXp);

  // Get all levels the user has now reached but hasn't been rewarded for yet.
  const claimed = await LevelReward.find({ userId: uid })
    .select("level")
    .lean<{ level: number }[]>();
  const claimedSet = new Set(claimed.map((c) => c.level));

  // Find the user's companyId (needed for wallet/AI credit ops).
  const user = await User.findById(uid).select("companyId").lean<{ companyId?: any }>();
  if (!user?.companyId) return;

  const companyId = user.companyId;

  for (let lvl = 1; lvl <= level; lvl++) {
    if (claimedSet.has(lvl)) continue;
    const rewards = LEVEL_CREDIT_REWARDS[lvl];
    if (!rewards) continue;
    if (rewards.ai === 0 && rewards.wallet === 0) continue;

    // Idempotent insert — unique index prevents double-crediting.
    try {
      await LevelReward.create({
        userId: uid,
        level: lvl,
        aiCredits: rewards.ai,
        walletCredits: rewards.wallet,
      });
    } catch (err: any) {
      if (err?.code === 11000) continue; // already claimed
      throw err;
    }

    const ref = new mongoose.Types.ObjectId().toString();

    // Credit AI credits
    if (rewards.ai > 0) {
      await Company.updateOne(
        { _id: companyId },
        { $inc: { aiCredits: rewards.ai } }
      );
      await WalletTransaction.create({
        companyId,
        amount: rewards.ai,
        type: "credit",
        status: "completed",
        description: `[ZapAcademy] Level ${lvl} reward — ${rewards.ai} AI credits`,
        reference: ref,
        referenceType: "level_reward",
        metadata: {
          isAiCredits: true,
          level: lvl,
          app: "zapacademy",
        },
      });
    }

    // Credit wallet balance
    if (rewards.wallet > 0) {
      await Company.updateOne(
        { _id: companyId },
        { $inc: { walletBalance: rewards.wallet } }
      );
      await WalletTransaction.create({
        companyId,
        amount: rewards.wallet,
        type: "credit",
        status: "completed",
        description: `[ZapAcademy] Level ${lvl} reward — ₹${rewards.wallet} wallet credits`,
        reference: ref,
        referenceType: "level_reward",
        metadata: {
          level: lvl,
          currency: "INR",
          app: "zapacademy",
        },
      });
    }
  }
}
