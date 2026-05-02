import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import Lesson from "@/models/Lesson";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/engine";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const rows = await Progress.find({ userId: user.id }).lean();
  return NextResponse.json({ progress: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  await dbConnect();
  const { weekSlug, lessonSlug, videoCompleted } = await req.json();

  if (!weekSlug || !lessonSlug) {
    return NextResponse.json({ error: "weekSlug and lessonSlug required" }, { status: 400 });
  }

  const existing = await Progress.findOne({ userId: user.id, weekSlug, lessonSlug });
  let xpAwarded = 0;
  let newBadges: string[] = [];

  if (videoCompleted && !existing?.videoCompletedAt) {
    const lesson = await Lesson.findOne({ weekSlug, lessonSlug })
      .select("xpVideoComplete")
      .lean<{ xpVideoComplete?: number }>();
    const reward = lesson?.xpVideoComplete ?? 50;

    await Progress.updateOne(
      { userId: user.id, weekSlug, lessonSlug },
      {
        $set: { videoCompletedAt: new Date(), videoXpAwardedAt: new Date() },
        $setOnInsert: { quizAttempts: 0 },
      },
      { upsert: true }
    );

    if (reward > 0) {
      const result = await awardXp({
        userId: user.id,
        amount: reward,
        kind: "videoComplete",
        weekSlug,
        lessonSlug,
      });
      xpAwarded = result.amountAwarded;
      newBadges = result.newBadges;
    }
  }

  return NextResponse.json({ ok: true, xpAwarded, newBadges });
}
