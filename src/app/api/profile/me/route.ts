import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import AcademyProfile from "@/models/AcademyProfile";

/**
 * GET  /api/profile/me  → returns the viewer's AcademyProfile (creates one if missing)
 * PUT  /api/profile/me  → upserts headline, bio, cover, location, socials
 *
 * Showcase items + pinned posts have their own dedicated endpoints
 * (`/api/profile/me/showcase`, `/api/profile/me/pin`) for predictable updates.
 */

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(user.id);
  let doc: any = await AcademyProfile.findOne({ userId: oid }).lean();
  if (!doc) {
    const created = await AcademyProfile.create({ userId: oid });
    doc = created.toObject();
  }
  return NextResponse.json({ profile: doc });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const oid = new mongoose.Types.ObjectId(user.id);
  await dbConnect();

  const set: Record<string, any> = {};
  if (typeof body.headline === "string") set.headline = body.headline.slice(0, 140);
  if (typeof body.bio === "string") set.bio = body.bio.slice(0, 2000);
  if (typeof body.coverUrl === "string") set.coverUrl = body.coverUrl;
  if (typeof body.avatarOverrideUrl === "string") set.avatarOverrideUrl = body.avatarOverrideUrl;
  if (typeof body.location === "string") set.location = body.location.slice(0, 80);
  if (body.socials && typeof body.socials === "object") {
    set.socials = sanitizeSocials(body.socials);
  }

  const updated = await AcademyProfile.findOneAndUpdate(
    { userId: oid },
    { $set: set, $setOnInsert: { userId: oid } },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json({ profile: updated });
}

function sanitizeSocials(s: any) {
  const handle = (v: any) =>
    typeof v === "string" ? v.trim().slice(0, 200) : undefined;
  const out: Record<string, any> = {
    website: handle(s.website),
    instagram: handle(s.instagram),
    linkedin: handle(s.linkedin),
    twitter: handle(s.twitter),
    youtube: handle(s.youtube),
    facebook: handle(s.facebook),
    tiktok: handle(s.tiktok),
    github: handle(s.github),
    whatsapp: handle(s.whatsapp),
    threads: handle(s.threads),
  };
  if (Array.isArray(s.custom)) {
    out.custom = s.custom
      .filter((c: any) => c?.label && c?.url)
      .slice(0, 8)
      .map((c: any) => ({
        id: typeof c.id === "string" ? c.id : new mongoose.Types.ObjectId().toString(),
        label: String(c.label).slice(0, 40),
        url: String(c.url).slice(0, 500),
        icon: typeof c.icon === "string" ? c.icon : undefined,
      }));
  }
  return out;
}
