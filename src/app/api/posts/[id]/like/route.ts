import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Like from "@/models/Like";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/engine";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Bad id" }, { status: 400 });

  await dbConnect();
  const me = new mongoose.Types.ObjectId(user.id);
  const postOid = new mongoose.Types.ObjectId(id);

  const post = await Post.findById(postOid).select("userId likeCount");
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Toggle
  const existing = await Like.findOne({ userId: me, postId: postOid });
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    await Post.updateOne({ _id: postOid }, { $inc: { likeCount: -1 } });
    return NextResponse.json({ liked: false, likeCount: Math.max(0, (post.likeCount || 0) - 1) });
  }

  try {
    await Like.create({ userId: me, postId: postOid });
  } catch (err: any) {
    if (err?.code !== 11000) throw err;
  }
  await Post.updateOne({ _id: postOid }, { $inc: { likeCount: 1 } });

  // Notify the author + small XP nudge
  if (post.userId.toString() !== user.id) {
    await Promise.all([
      Notification.create({
        userId: post.userId,
        actorId: me,
        kind: "post_like",
        body: `${user.name} liked your post`,
        href: `/community#post-${id}`,
      }),
      awardXp({
        userId: post.userId,
        amount: 5,
        kind: "postLiked",
        meta: { postId: id, likedBy: user.id },
      }),
    ]);
  }

  return NextResponse.json({ liked: true, likeCount: (post.likeCount || 0) + 1 });
}
