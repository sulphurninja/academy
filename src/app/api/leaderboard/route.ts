import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/engine";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Number(searchParams.get("limit") || 25));

  const rows = await getLeaderboard(limit);
  return NextResponse.json({ leaders: rows });
}
