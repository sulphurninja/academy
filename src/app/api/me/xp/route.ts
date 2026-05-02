import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTotalXp } from "@/lib/engine";
import { levelFromXp } from "@/lib/xp";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const xp = await getTotalXp(user.id);
  return NextResponse.json({ xp, level: levelFromXp(xp) });
}
