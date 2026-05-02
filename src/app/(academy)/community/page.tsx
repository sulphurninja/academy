import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMember } from "@/lib/profile";
import CommunityClient from "./_client";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const me = await getMember(user.id);

  return (
    <CommunityClient
      isAdmin={!!user.isAdmin}
      me={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: me?.avatarUrl || null,
        companyLogoUrl: me?.companyLogoUrl || null,
      }}
    />
  );
}
