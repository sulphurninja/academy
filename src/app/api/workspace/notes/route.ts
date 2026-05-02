import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import WorkspaceNote from "@/models/WorkspaceNote";
import mongoose from "mongoose";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const notes = await WorkspaceNote.find({
    userId: new mongoose.Types.ObjectId(user.id),
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    notes.map((n: any) => ({
      id: n._id.toString(),
      title: n.title,
      body: n.body,
      updatedAt: n.updatedAt.toISOString(),
      createdAt: n.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { title, body } = await req.json();

  await dbConnect();

  const note = await WorkspaceNote.create({
    userId: user.id,
    title: (title || "Untitled").slice(0, 200),
    body: (body || "").slice(0, 50000),
  });

  return NextResponse.json({ ok: true, id: note._id.toString() });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, body } = await req.json();
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await dbConnect();

  const update: any = {};
  if (title !== undefined) update.title = (title || "Untitled").slice(0, 200);
  if (body !== undefined) update.body = (body || "").slice(0, 50000);

  await WorkspaceNote.updateOne(
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

  await WorkspaceNote.deleteOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  return NextResponse.json({ ok: true });
}
