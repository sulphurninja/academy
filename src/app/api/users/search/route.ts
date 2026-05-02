import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listMembers } from "@/lib/profile";

/**
 * /api/users/search?q=...&limit=&skip=
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(50, Number(searchParams.get("limit") || 24));
  const skip = Math.max(0, Number(searchParams.get("skip") || 0));

  const { members, total } = await listMembers({
    viewerId: user.id,
    search: q.trim() || undefined,
    limit,
    skip,
  });

  return NextResponse.json({ members, total });
}
