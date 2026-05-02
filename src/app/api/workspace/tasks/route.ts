import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import WorkspaceTask from "@/models/WorkspaceTask";
import mongoose from "mongoose";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const status = searchParams.get("status");

  await dbConnect();

  const filter: any = { userId: new mongoose.Types.ObjectId(user.id) };
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (status) filter.status = status;

  const tasks = await WorkspaceTask.find(filter)
    .sort({ status: 1, priority: -1, createdAt: -1 })
    .lean();

  return NextResponse.json(
    tasks.map((t: any) => ({
      id: t._id.toString(),
      title: t.title,
      category: t.category,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() || null,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.planAllowed) return NextResponse.json({ error: "Plan required" }, { status: 403 });

  const { title, category, priority, dueDate } = await req.json();
  if (!title?.trim())
    return NextResponse.json({ error: "Title required" }, { status: 400 });

  await dbConnect();

  const task = await WorkspaceTask.create({
    userId: user.id,
    title: title.trim().slice(0, 300),
    category: category || "marketing",
    priority: priority || "medium",
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });

  return NextResponse.json({ ok: true, id: task._id.toString() });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, category, priority, dueDate, status } = await req.json();
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await dbConnect();

  const update: any = {};
  if (title) update.title = title.trim().slice(0, 300);
  if (category) update.category = category;
  if (priority) update.priority = priority;
  if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null;
  if (status) update.status = status;

  await WorkspaceTask.updateOne(
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

  await WorkspaceTask.deleteOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  return NextResponse.json({ ok: true });
}
