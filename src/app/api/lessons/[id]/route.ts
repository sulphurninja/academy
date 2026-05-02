import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { id } = await ctx.params;
  await dbConnect();
  const lesson = await Lesson.findById(id).lean();
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip correct answers
  const safe: any = { ...lesson };
  if (safe.quiz?.questions) {
    safe.quiz.questions = safe.quiz.questions.map((q: any) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      points: q.points,
    }));
  }
  return NextResponse.json({ lesson: safe });
}
