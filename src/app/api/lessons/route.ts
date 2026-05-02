import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const weekSlug = searchParams.get("weekSlug");
  const filter: any = { isPublished: true };
  if (weekSlug) filter.weekSlug = weekSlug;

  const rows = await Lesson.find(filter)
    .select("weekSlug lessonSlug title summary videoProvider durationSeconds challenge xpVideoComplete updatedAt")
    .lean();

  return NextResponse.json({ lessons: rows });
}
