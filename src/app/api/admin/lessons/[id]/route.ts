import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await dbConnect();
  await Lesson.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
