import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ContentCard from "@/models/ContentCard";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const cards = await ContentCard.find({
    userId: new mongoose.Types.ObjectId(user.id),
  })
    .sort({ column: 1, position: 1 })
    .lean();

  return NextResponse.json(
    cards.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description || "",
      channel: c.channel || null,
      dueDate: c.dueDate?.toISOString() || null,
      column: c.column,
      position: c.position,
    }))
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { title, description, channel, dueDate, column } = await req.json();
  if (!title?.trim())
    return NextResponse.json({ error: "Title required" }, { status: 400 });

  await dbConnect();

  const maxPos = await ContentCard.findOne({
    userId: new mongoose.Types.ObjectId(user.id),
    column: column || "ideas",
  })
    .sort({ position: -1 })
    .select("position")
    .lean<{ position: number } | null>();

  const card = await ContentCard.create({
    userId: user.id,
    title: title.trim().slice(0, 200),
    description: (description || "").slice(0, 2000),
    channel: channel || undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    column: column || "ideas",
    position: (maxPos?.position ?? -1) + 1,
  });

  return NextResponse.json({ ok: true, id: card._id.toString() });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, description, channel, dueDate, column, position } = await req.json();
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await dbConnect();

  const update: any = {};
  if (title) update.title = title.trim().slice(0, 200);
  if (description !== undefined) update.description = (description || "").slice(0, 2000);
  if (channel !== undefined) update.channel = channel || undefined;
  if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null;
  if (column) update.column = column;
  if (position !== undefined) update.position = position;

  await ContentCard.updateOne(
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

  await ContentCard.deleteOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  return NextResponse.json({ ok: true });
}
