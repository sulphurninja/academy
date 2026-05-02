import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  await Notification.updateMany(
    { userId: new mongoose.Types.ObjectId(user.id), readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}
