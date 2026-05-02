import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { getCurrentUser } from "@/lib/auth";

/**
 * Admin moderation: pin/unpin and hide/unhide a post.
 * PATCH body: { isPinned?: boolean, isHidden?: boolean }
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const body = await req.json();
  const update: any = {};
  if (typeof body.isPinned === "boolean") update.isPinned = body.isPinned;
  if (typeof body.isHidden === "boolean") {
    update.isHidden = body.isHidden;
    if (body.isHidden) {
      update.hiddenAt = new Date();
      update.hiddenBy = new mongoose.Types.ObjectId(user.id);
    } else {
      update.hiddenAt = null;
      update.hiddenBy = null;
    }
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await dbConnect();
  const post = await Post.findByIdAndUpdate(id, { $set: update }, { new: true });
  return NextResponse.json({ ok: true, post });
}
