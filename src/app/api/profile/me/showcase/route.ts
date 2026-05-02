import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import AcademyProfile, { type ShowcaseItem } from "@/models/AcademyProfile";

/**
 * Showcase / promo links / affiliate links / posts the member wants to push
 * on their public profile page.
 *
 * Replace-all semantics: PUT body = full ordered list. Easier than CRUD-per-row
 * since the editor always uses the latest snapshot.
 */

const ALLOWED_KINDS = new Set(["product", "affiliate", "post", "link"]);
const MAX_ITEMS = 24;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(user.id);
  const doc = await AcademyProfile.findOne({ userId: oid }).select("showcase").lean<{
    showcase?: ShowcaseItem[];
  }>();
  return NextResponse.json({ showcase: doc?.showcase ?? [] });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const items: ShowcaseItem[] = Array.isArray(body.items) ? body.items : [];

  const cleaned: ShowcaseItem[] = items
    .filter((it: any) => it?.title && it?.url)
    .slice(0, MAX_ITEMS)
    .map((it: any, idx: number) => ({
      id: typeof it.id === "string" && it.id ? it.id : new mongoose.Types.ObjectId().toString(),
      kind: ALLOWED_KINDS.has(it.kind) ? it.kind : "link",
      title: String(it.title).slice(0, 120),
      description:
        typeof it.description === "string" ? it.description.slice(0, 400) : undefined,
      url: String(it.url).slice(0, 500),
      imageUrl: typeof it.imageUrl === "string" ? it.imageUrl : undefined,
      cta: typeof it.cta === "string" ? it.cta.slice(0, 32) : undefined,
      badge: typeof it.badge === "string" ? it.badge.slice(0, 32) : undefined,
      tag: typeof it.tag === "string" ? it.tag.slice(0, 32) : undefined,
      order: typeof it.order === "number" ? it.order : idx,
    }));

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(user.id);
  const updated = await AcademyProfile.findOneAndUpdate(
    { userId: oid },
    { $set: { showcase: cleaned }, $setOnInsert: { userId: oid } },
    { new: true, upsert: true }
  )
    .select("showcase")
    .lean<{ showcase?: ShowcaseItem[] }>();

  return NextResponse.json({ showcase: updated?.showcase ?? [] });
}
