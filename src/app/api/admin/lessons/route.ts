import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import { findLesson } from "@/lib/curriculum";
import { getCurrentUser } from "@/lib/auth";

/**
 * Admin endpoint to upsert a lesson against the curriculum spine.
 * Body: { weekSlug, lessonSlug, videoUrl, videoProvider, durationSeconds?, isPublished?, xpVideoComplete?, quiz?, resources?, challenge? }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const body = await req.json();
  const {
    weekSlug,
    lessonSlug,
    videoUrl,
    videoProvider,
    durationSeconds,
    isPublished,
    xpVideoComplete,
    quiz,
    resources,
    challenge,
    content,
  } = body;

  const found = findLesson(weekSlug, lessonSlug);
  if (!found) {
    return NextResponse.json(
      { error: `Unknown lesson "${weekSlug}/${lessonSlug}". Must match curriculum.ts.` },
      { status: 400 }
    );
  }

  const update: any = {
    title: found.lesson.title,
    summary: found.lesson.summary,
    challenge: challenge ?? found.lesson.challenge,
    authorId: user.id,
  };
  if (videoUrl !== undefined) update.videoUrl = videoUrl || undefined;
  if (videoProvider) update.videoProvider = videoProvider;
  if (durationSeconds !== undefined) update.durationSeconds = durationSeconds;
  if (isPublished !== undefined) update.isPublished = !!isPublished;
  if (xpVideoComplete !== undefined) update.xpVideoComplete = Number(xpVideoComplete) || 50;
  if (quiz !== undefined) update.quiz = quiz;
  if (resources !== undefined) update.resources = resources;
  if (content !== undefined) {
    update.content = content;
    update.readingTimeMinutes = Math.ceil((content || "").length / 1200) || undefined;
  }

  const lesson = await Lesson.findOneAndUpdate(
    { weekSlug, lessonSlug },
    { $set: update, $setOnInsert: { weekSlug, lessonSlug } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, lesson });
}
