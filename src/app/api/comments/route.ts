import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Company from "@/models/Company";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/engine";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const weekSlug = searchParams.get("weekSlug");
  const lessonSlug = searchParams.get("lessonSlug");
  if (!weekSlug || !lessonSlug) {
    return NextResponse.json({ error: "weekSlug and lessonSlug required" }, { status: 400 });
  }

  const rows = await Comment.find({ weekSlug, lessonSlug, isHidden: { $ne: true } })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(100)
    .lean();

  const userIds = Array.from(new Set(rows.map((r) => r.userId.toString())));
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
      authorName: u?.name || "Cohort member",
      authorEmail: u?.email || "",
      authorAvatarUrl: co?.whatsappProfile?.profilePictureUrl || null,
      likes: c.likes?.length || 0,
      liked: !!c.likes?.some((id: any) => id.toString() === me),
    };
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  await dbConnect();
  const { weekSlug, lessonSlug, body, parentId } = await req.json();
  if (!weekSlug || !lessonSlug || !body?.trim()) {
    return NextResponse.json({ error: "weekSlug, lessonSlug, body required" }, { status: 400 });
  }

  const c = await Comment.create({
    userId: user.id,
    weekSlug,
    lessonSlug,
    body: body.trim().slice(0, 4000),
    parentId,
  });

  // +10 XP for thoughtful contribution. Cap by checking last hour to prevent spam-farming.
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await Comment.countDocuments({
    userId: user.id,
    createdAt: { $gte: since },
  });
  if (recent <= 5) {
    await awardXp({
      userId: user.id,
      amount: 10,
      kind: "comment",
      weekSlug,
      lessonSlug,
      meta: { commentId: c._id.toString() },
    });
  }

  return NextResponse.json({ ok: true });
}
