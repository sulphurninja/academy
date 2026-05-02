import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const weekSlug = searchParams.get("weekSlug");
  const lessonSlug = searchParams.get("lessonSlug");
  if (!weekSlug || !lessonSlug)
    return NextResponse.json({ error: "weekSlug and lessonSlug required" }, { status: 400 });

  await dbConnect();
  const note = await Note.findOne({ userId: user.id, weekSlug, lessonSlug })
    .select("body updatedAt")
    .lean<{ body: string; updatedAt: Date }>();

  return NextResponse.json({ body: note?.body || "", updatedAt: note?.updatedAt || null });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { weekSlug, lessonSlug, body } = await req.json();
  if (!weekSlug || !lessonSlug)
    return NextResponse.json({ error: "weekSlug and lessonSlug required" }, { status: 400 });

  await dbConnect();
  await Note.findOneAndUpdate(
    { userId: user.id, weekSlug, lessonSlug },
    { body: (body || "").slice(0, 10000) },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
