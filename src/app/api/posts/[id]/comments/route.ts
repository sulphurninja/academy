import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import PostComment from "@/models/PostComment";
import Post from "@/models/Post";
import User from "@/models/User";
import Company from "@/models/Company";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/engine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;
  if (!mongoose.Types.ObjectId.isValid(postId))
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });

  await dbConnect();

  const rows = await PostComment.find({ postId, isHidden: { $ne: true } })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  const userIds = Array.from(new Set(rows.map((r: any) => r.userId.toString())));
  const users = userIds.length
    ? await User.find({
        _id: { $in: userIds.map((s) => new mongoose.Types.ObjectId(s)) },
      })
        .select("_id name email companyId")
        .lean<{ _id: any; name: string; email: string; companyId?: any }[]>()
    : [];
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const companyIds = users.map((u) => u.companyId).filter(Boolean);
  const companies = companyIds.length
    ? await Company.find({ _id: { $in: companyIds } })
        .select("_id whatsappProfile")
        .lean<{ _id: any; whatsappProfile?: { profilePictureUrl?: string } }[]>()
    : [];
  const companyMap = new Map(companies.map((c: any) => [c._id.toString(), c]));

  const me = user.id;
  const comments = rows.map((c: any) => {
    const u = userMap.get(c.userId.toString());
    const co = u?.companyId ? companyMap.get(u.companyId.toString()) : null;
    return {
      _id: c._id.toString(),
      body: c.body,
      createdAt: c.createdAt,
      authorId: c.userId.toString(),
      authorName: u?.name || "Member",
      authorEmail: u?.email || "",
      authorAvatarUrl: co?.whatsappProfile?.profilePictureUrl || null,
      parentId: c.parentId?.toString() || null,
      likes: c.likes?.length || 0,
      liked: !!c.likes?.some((lid: any) => lid.toString() === me),
    };
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { id: postId } = await params;
  if (!mongoose.Types.ObjectId.isValid(postId))
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });

  await dbConnect();

  const post = await Post.findById(postId).lean<{ _id: any; userId: any }>();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { body, parentId } = await req.json();
  if (!body?.trim())
    return NextResponse.json({ error: "Body is required" }, { status: 400 });

  const comment = await PostComment.create({
    postId,
    userId: user.id,
    body: body.trim().slice(0, 4000),
    parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : undefined,
  });

  await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

  if (post.userId.toString() !== user.id) {
    await Notification.create({
      userId: post.userId,
      actorId: user.id,
      kind: "post_comment",
      body: `${user.name} commented on your post`,
      href: `/community#post-${postId}`,
    });
  }

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await PostComment.countDocuments({
    userId: user.id,
    createdAt: { $gte: since },
  });
  if (recent <= 5) {
    await awardXp({
      userId: user.id,
      amount: 10,
      kind: "comment",
      meta: { postCommentId: comment._id.toString(), postId },
    });
  }

  return NextResponse.json({ ok: true, id: comment._id.toString() });
}
