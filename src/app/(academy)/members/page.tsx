import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listMembers } from "@/lib/profile";
import MembersClient from "./_client";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const q = sp.q?.trim() || "";

  const { members, total } = await listMembers({
    viewerId: user.id,
    search: q || undefined,
    limit: 24,
    excludeIds: [user.id],
  });

  return <MembersClient initialMembers={members} initialTotal={total} initialQuery={q} />;
}
