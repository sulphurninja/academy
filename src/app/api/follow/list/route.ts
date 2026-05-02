import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Follow from "@/models/Follow";
import User from "@/models/User";
import Company from "@/models/Company";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/follow/list?userId=xxx&type=followers|following&limit=50&skip=0
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const type = searchParams.get("type") || "followers";
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const skip = Number(searchParams.get("skip") || 0);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId))
    return NextResponse.json({ error: "Bad userId" }, { status: 400 });

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(userId);

  const filter =
    type === "following"
      ? { followerId: oid }
      : { followingId: oid };
  const targetField = type === "following" ? "followingId" : "followerId";

  const [rows, total] = await Promise.all([
    Follow.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<any[]>(),
    Follow.countDocuments(filter),
  ]);

  const targetIds = rows.map((r: any) => r[targetField]);
  const users = await User.find({ _id: { $in: targetIds } })
    .select("_id name email companyId")
    .lean<{ _id: any; name: string; email: string; companyId?: any }[]>();

  const companyIds = users.map((u) => u.companyId).filter(Boolean);
  const companies = companyIds.length
    ? await Company.find({ _id: { $in: companyIds } })
        .select("_id name whatsappProfile.profilePictureUrl")
        .lean<{ _id: any; name?: string; whatsappProfile?: { profilePictureUrl?: string } }[]>()
    : [];

  const companyMap = new Map(companies.map((c: any) => [c._id.toString(), c]));
  const me = new mongoose.Types.ObjectId(user.id);
  const viewerFollows = await Follow.find({
    followerId: me,
    followingId: { $in: targetIds },
  }).select("followingId").lean<{ followingId: any }[]>();
  const followingSet = new Set(viewerFollows.map((f: any) => f.followingId.toString()));

  const members = users.map((u: any) => {
    const company = u.companyId ? companyMap.get(u.companyId.toString()) : null;
    return {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      companyName: company?.name || null,
      avatarUrl: company?.whatsappProfile?.profilePictureUrl || null,
      isFollowing: followingSet.has(u._id.toString()),
      isMe: u._id.toString() === user.id,
    };
  });

  return NextResponse.json({ members, total });
}
