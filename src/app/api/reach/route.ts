import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import ReachRequest from "@/models/ReachRequest";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/reach
 *   { action: "request", userId, message? }  — send a reach request
 *   { action: "accept",  requestId }          — accept a pending request
 *   { action: "reject",  requestId }          — reject a pending request
 *
 * GET /api/reach?userId=xyz  — check reach status between viewer & userId
 */

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json();
  const me = new mongoose.Types.ObjectId(user.id);

  if (body.action === "request") {
    const { userId, message } = body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return NextResponse.json({ error: "Bad userId" }, { status: 400 });
    if (userId === user.id)
      return NextResponse.json({ error: "Cannot reach yourself" }, { status: 400 });

    const them = new mongoose.Types.ObjectId(userId);

    let doc;
    try {
      doc = await ReachRequest.create({ fromUserId: me, toUserId: them, message: message?.slice(0, 300) });
    } catch (err: any) {
      if (err?.code === 11000)
        return NextResponse.json({ error: "Request already sent" }, { status: 409 });
      throw err;
    }

    await Notification.create({
      userId: them,
      actorId: me,
      kind: "reach_request" as any,
      body: `${user.name} wants to connect with you`,
      href: "/notifications",
      meta: { type: "reach_request", requestId: doc._id.toString() },
    });

    return NextResponse.json({ ok: true, status: "pending" });
  }

  if (body.action === "accept" || body.action === "reject") {
    const { requestId } = body;
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId))
      return NextResponse.json({ error: "Bad requestId" }, { status: 400 });

    const rr = await ReachRequest.findById(requestId);
    if (!rr) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rr.toUserId.toString() !== user.id)
      return NextResponse.json({ error: "Not your request" }, { status: 403 });
    if (rr.status !== "pending")
      return NextResponse.json({ error: "Already responded" }, { status: 400 });

    rr.status = body.action === "accept" ? "accepted" : "rejected";
    rr.respondedAt = new Date();
    await rr.save();

    if (body.action === "accept") {
      await Notification.create({
        userId: rr.fromUserId,
        actorId: me,
        kind: "reach_accepted" as any,
        body: `${user.name} accepted your connect request — you can now see each other's contact info`,
        href: `/u/${user.id}`,
        meta: { type: "reach_accepted" },
      });
    }

    return NextResponse.json({ ok: true, status: rr.status });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || !mongoose.Types.ObjectId.isValid(userId))
    return NextResponse.json({ error: "Bad userId" }, { status: 400 });

  await dbConnect();
  const me = new mongoose.Types.ObjectId(user.id);
  const them = new mongoose.Types.ObjectId(userId);

  const [sent, received] = await Promise.all([
    ReachRequest.findOne({ fromUserId: me, toUserId: them }).lean<{ status: string }>(),
    ReachRequest.findOne({ fromUserId: them, toUserId: me }).lean<{ status: string }>(),
  ]);

  const mutual =
    (sent?.status === "accepted") || (received?.status === "accepted");

  let contactInfo = null;
  if (mutual) {
    const target = await User.findById(them)
      .select("email wabaAccounts")
      .lean<{ email: string; wabaAccounts?: { phoneNumber?: string }[] }>();
    contactInfo = {
      email: target?.email,
      whatsapp: target?.wabaAccounts?.[0]?.phoneNumber || null,
    };
  }

  return NextResponse.json({
    sentStatus: sent?.status || null,
    receivedStatus: received?.status || null,
    mutual,
    contactInfo,
  });
}
