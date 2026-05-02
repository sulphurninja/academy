import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BadgeEarned from "@/models/BadgeEarned";
import { getCurrentUser } from "@/lib/auth";
import { BADGES } from "@/lib/badges";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const earned = await BadgeEarned.find({ userId: user.id })
    .lean<{ badgeId: string; earnedAt: Date }[]>();

  return NextResponse.json({
    catalogue: BADGES,
    earned: earned.map((b) => ({ badgeId: b.badgeId, earnedAt: b.earnedAt })),
  });
}
