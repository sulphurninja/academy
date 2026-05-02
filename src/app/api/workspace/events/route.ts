import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CampaignEvent from "@/models/CampaignEvent";
import mongoose from "mongoose";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth()));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  await dbConnect();

  const events = await CampaignEvent.find({
    userId: new mongoose.Types.ObjectId(user.id),
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  return NextResponse.json(
    events.map((e: any) => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description || "",
      date: e.date.toISOString(),
      channel: e.channel,
      status: e.status,
      color: e.color,
    }))
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { title, description, date, channel, status, color } = await req.json();
  if (!title?.trim() || !date)
    return NextResponse.json({ error: "Title and date required" }, { status: 400 });

  await dbConnect();

  const event = await CampaignEvent.create({
    userId: user.id,
    title: title.trim().slice(0, 200),
    description: (description || "").slice(0, 1000),
    date: new Date(date),
    channel: channel || "whatsapp",
    status: status || "draft",
    color: color || "#10b981",
  });

  return NextResponse.json({ ok: true, id: event._id.toString() });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, description, date, channel, status, color } = await req.json();
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await dbConnect();

  const update: any = {};
  if (title) update.title = title.trim().slice(0, 200);
  if (description !== undefined) update.description = (description || "").slice(0, 1000);
  if (date) update.date = new Date(date);
  if (channel) update.channel = channel;
  if (status) update.status = status;
  if (color) update.color = color;

  await CampaignEvent.updateOne(
    { _id: id, userId: new mongoose.Types.ObjectId(user.id) },
    { $set: update }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await dbConnect();

  await CampaignEvent.deleteOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  return NextResponse.json({ ok: true });
}
