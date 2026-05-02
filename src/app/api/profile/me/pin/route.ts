import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import AcademyProfile from "@/models/AcademyProfile";
import Post from "@/models/Post";

/**
 * POST   /api/profile/me/pin   { postId }   → toggle pin on the viewer's profile
 *
 * Pinned posts surface at the top of /u/[id]'s feed. Cap at 6.
 * Only the post owner can pin their own posts.
 */

const MAX_PINS = 6;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const postId = body?.postId;
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return NextResponse.json({ error: "Bad postId" }, { status: 400 });
  }

  await dbConnect();
  const userOid = new mongoose.Types.ObjectId(user.id);
  const postOid = new mongoose.Types.ObjectId(postId);

  // Confirm the post belongs to the viewer
  const post = await Post.findById(postOid).select("userId").lean<{ userId: any }>();
  if (!post || post.userId.toString() !== user.id) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existing = await AcademyProfile.findOne({ userId: userOid })
    .select("pinnedPostIds")
    .lean<{ pinnedPostIds: any[] }>();

  const current = (existing?.pinnedPostIds || []).map((p: any) => p.toString());
  let next: string[];
  let pinned: boolean;
  if (current.includes(postId)) {
    next = current.filter((p) => p !== postId);
    pinned = false;
  } else {
    next = [postId, ...current].slice(0, MAX_PINS);
    pinned = true;
  }

  await AcademyProfile.findOneAndUpdate(
    { userId: userOid },
    {
      $set: { pinnedPostIds: next.map((id) => new mongoose.Types.ObjectId(id)) },
      $setOnInsert: { userId: userOid },
    },
    { upsert: true }
  );

  return NextResponse.json({ pinned, pinnedPostIds: next });
}
