import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { tickStreak } from "@/lib/engine";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await tickStreak(user.id);
  return NextResponse.json(result);
}
