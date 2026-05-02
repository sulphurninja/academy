import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const me = new mongoose.Types.ObjectId(user.id);
  const rows = await Notification.find({ userId: me })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const actorIds = Array.from(
    new Set(
      rows
        .map((r: any) => r.actorId?.toString())
        .filter(Boolean) as string[]
    )
  );
  const actors = actorIds.length
    ? await User.find({
        _id: { $in: actorIds.map((s) => new mongoose.Types.ObjectId(s)) },
      })
        .select("name email")
        .lean<{ _id: any; name: string; email: string }[]>()
    : [];
  const actorMap = new Map(actors.map((a: any) => [a._id.toString(), a]));

  const unreadCount = rows.filter((r: any) => !r.readAt).length;

  return NextResponse.json({
    notifications: rows.map((r: any) => ({
      id: r._id.toString(),
      kind: r.kind,
      body: r.body,
      href: r.href,
      meta: r.meta,
      readAt: r.readAt,
      createdAt: r.createdAt,
      actor: r.actorId ? actorMap.get(r.actorId.toString()) || null : null,
    })),
    unreadCount,
  });
}
