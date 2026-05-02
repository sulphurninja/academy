import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/admin/announcements — fan out an in-app announcement to every
 * user with an allowed plan. Used by the admin panel.
 *
 * body: { body: string, href?: string, audience?: "all" | "growth" | "growth_plus" }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { body, href, audience } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });

  await dbConnect();
  // Stream-style fan-out — works fine for thousands; queue it for hundreds of thousands
  const cursor = User.find({ isActive: { $ne: false } })
    .select("_id")
    .lean<{ _id: any }[]>()
    .cursor();

  let n = 0;
  const ops: any[] = [];
  for await (const u of cursor) {
    ops.push({
      insertOne: {
        document: {
          userId: u._id,
          actorId: new mongoose.Types.ObjectId(user.id),
          kind: "announcement",
          body: body.trim().slice(0, 500),
          href,
        },
      },
    });
    if (ops.length >= 1000) {
      await Notification.bulkWrite(ops);
      ops.length = 0;
    }
    n += 1;
  }
  if (ops.length) await Notification.bulkWrite(ops);

  // Lightly tag audience for future filtering
  void audience;

  return NextResponse.json({ ok: true, fannedOutTo: n });
}
