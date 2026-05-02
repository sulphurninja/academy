import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Like from "@/models/Like";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Bad id" }, { status: 400 });

  await dbConnect();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owns = post.userId.toString() === user.id;
  const canModerate = user.isAdmin;
  if (!owns && !canModerate) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Promise.all([
    Post.deleteOne({ _id: post._id }),
    Like.deleteMany({ postId: post._id }),
  ]);

  return NextResponse.json({ ok: true });
}
