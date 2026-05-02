import { redirect } from "next/navigation";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import AcademyProfile, { type IAcademyProfile } from "@/models/AcademyProfile";
import { getMember } from "@/lib/profile";
import ProfileEditorClient from "./_client";

export const dynamic = "force-dynamic";

export default async function ProfileEditorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(user.id);
  let profile = await AcademyProfile.findOne({ userId: oid }).lean<IAcademyProfile>();
  if (!profile) {
    const created = await AcademyProfile.create({ userId: oid });
    profile = created.toObject();
  }

  const member = await getMember(user.id);
  if (!member) redirect("/login");

  return (
    <ProfileEditorClient
      member={{
        id: member.id,
        name: member.name,
        email: member.email,
        avatarUrl: member.avatarUrl || null,
        companyLogoUrl: member.companyLogoUrl || null,
        companyName: member.companyName || null,
      }}
      initial={JSON.parse(JSON.stringify(profile))}
    />
  );
}
