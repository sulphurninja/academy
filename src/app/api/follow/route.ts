import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Follow from "@/models/Follow";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/follow  body: { userId, action: "follow" | "unfollow" }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { userId, action } = await req.json();
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Bad userId" }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const me = new mongoose.Types.ObjectId(user.id);
  const them = new mongoose.Types.ObjectId(userId);

  if (action === "unfollow") {
    await Follow.deleteOne({ followerId: me, followingId: them });
    return NextResponse.json({ ok: true, isFollowing: false });
  }

  try {
    await Follow.create({ followerId: me, followingId: them });
  } catch (err: any) {
    if (err?.code !== 11000) throw err;
  }
  await Notification.create({
    userId: them,
    actorId: me,
    kind: "follow",
    body: `${user.name} started following you`,
    href: `/u/${user.id}`,
  });
  return NextResponse.json({ ok: true, isFollowing: true });
}
