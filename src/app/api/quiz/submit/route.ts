import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import QuizAttempt from "@/models/QuizAttempt";
import { getCurrentUser } from "@/lib/auth";
import { awardXp, getTotalXp } from "@/lib/engine";

/**
 * Grade a quiz submission server-side. Idempotency:
 *   - we always record an attempt
 *   - XP for "passing" is granted once (subsequent passes record the attempt but don't pay)
 *   - XP for "perfect first try" is granted once
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  await dbConnect();
  const { weekSlug, lessonSlug, answers } = await req.json();
  if (!weekSlug || !lessonSlug || !answers) {
    return NextResponse.json({ error: "weekSlug, lessonSlug, answers required" }, { status: 400 });
  }

  const lesson = await Lesson.findOne({ weekSlug, lessonSlug, isPublished: true }).lean<{
    quiz?: {
      passScore?: number;
      xpOnPass?: number;
      xpOnPerfect?: number;
      questions: any[];
    };
  }>();
  if (!lesson?.quiz?.questions?.length) {
    return NextResponse.json({ error: "No quiz published for this lesson" }, { status: 404 });
  }

  // Grade
  let earnedPoints = 0;
  let totalPoints = 0;
  const perQuestion: { id: string; correct: boolean }[] = [];

  for (const q of lesson.quiz.questions) {
    totalPoints += q.points || 10;
    const submitted = answers[q.id];
    let correct = false;

    if (q.type === "mcq") {
      correct =
        typeof submitted === "string" &&
        Array.isArray(q.correct) &&
        q.correct.length === 1 &&
        submitted.trim() === q.correct[0];
    } else if (q.type === "multi") {
      const arr = Array.isArray(submitted) ? submitted : [];
      const ok =
        Array.isArray(q.correct) &&
        arr.length === q.correct.length &&
        q.correct.every((c: string) => arr.includes(c));
      correct = ok;
    } else if (q.type === "short") {
      const txt = (typeof submitted === "string" ? submitted : "").trim().toLowerCase();
      correct =
        Array.isArray(q.correct) &&
        q.correct.some((c: string) => c.trim().toLowerCase() === txt);
    }

    if (correct) earnedPoints += q.points || 10;
    perQuestion.push({ id: q.id, correct });
  }

  const score = totalPoints === 0 ? 0 : earnedPoints / totalPoints;
  const passScore = lesson.quiz.passScore ?? 0.7;
  const passed = score >= passScore;
  const perfect = score >= 0.999;

  // Existing progress
  const prog = await Progress.findOne({ userId: user.id, weekSlug, lessonSlug });
  const wasPassed = !!prog?.quizPassedAt;
  const wasPerfect = !!prog?.quizPerfectAt;
  const attemptNumber = (prog?.quizAttempts || 0) + 1;

  // Award XP
  let xpAwarded = 0;
  const xpOnPass = lesson.quiz.xpOnPass ?? 100;
  const xpOnPerfect = lesson.quiz.xpOnPerfect ?? 250;

  if (passed && !wasPassed) {
    const isFirstTry = attemptNumber === 1;
    const baseAward = isFirstTry ? Math.max(xpOnPass, 200) : xpOnPass;
    const r = await awardXp({
      userId: user.id,
      amount: baseAward,
      kind: isFirstTry ? "quizPassFirstTry" : "quizPass",
      weekSlug,
      lessonSlug,
      meta: { score, attempt: attemptNumber },
    });
    xpAwarded += r.amountAwarded;
  }
  if (perfect && !wasPerfect) {
    const r = await awardXp({
      userId: user.id,
      amount: xpOnPerfect,
      kind: "perfectQuiz",
      weekSlug,
      lessonSlug,
      meta: { score, attempt: attemptNumber },
    });
    xpAwarded += r.amountAwarded;
  }

  // Persist attempt + progress
  await QuizAttempt.create({
    userId: user.id,
    weekSlug,
    lessonSlug,
    answers,
    score,
    passed,
    perfect,
    xpAwarded,
  });

  await Progress.updateOne(
    { userId: user.id, weekSlug, lessonSlug },
    {
      $set: {
        ...(passed && !wasPassed ? { quizPassedAt: new Date() } : {}),
        ...(perfect && !wasPerfect ? { quizPerfectAt: new Date() } : {}),
        ...(prog?.quizBestScore == null || score > prog.quizBestScore
          ? { quizBestScore: score }
          : {}),
      },
      $inc: { quizAttempts: 1 },
      $setOnInsert: { videoCompletedAt: prog?.videoCompletedAt },
    },
    { upsert: true }
  );

  // Recheck badges (already done inside awardXp, but if no XP was awarded — quiz was a retry —
  // we still want to surface any badges that became earnable from elsewhere). Cheap.
  const newBadges: string[] = [];
  // (Badges are recomputed inside awardXp, so this list is the union.)

  const totalXp = await getTotalXp(user.id);

  return NextResponse.json({
    score,
    passed,
    perfect,
    xpAwarded,
    totalXp,
    newBadges,
    perQuestion,
  });
}
