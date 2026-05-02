import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";

/**
 * GET  /api/bookmarks                               → list the viewer's bookmarks
 * POST /api/bookmarks  { weekSlug, lessonSlug, title? }  → toggle (create / delete)
 */

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const items = await Bookmark.find({ userId: new mongoose.Types.ObjectId(user.id) })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ bookmarks: items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const weekSlug = String(body.weekSlug || "").slice(0, 60);
  const lessonSlug = String(body.lessonSlug || "").slice(0, 80);
  const title = typeof body.title === "string" ? body.title.slice(0, 200) : undefined;
  if (!weekSlug || !lessonSlug) {
    return NextResponse.json({ error: "Bad weekSlug / lessonSlug" }, { status: 400 });
  }

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(user.id);
  const existing = await Bookmark.findOne({ userId: oid, weekSlug, lessonSlug });
  if (existing) {
    await existing.deleteOne();
    return NextResponse.json({ bookmarked: false });
  }
  await Bookmark.create({ userId: oid, weekSlug, lessonSlug, title });
  return NextResponse.json({ bookmarked: true });
}
