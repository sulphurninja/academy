import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMember } from "@/lib/profile";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import CommunityClient from "../../community/_client";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-base font-bold text-rose-700 inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Forbidden
        </h1>
        <p className="text-sm text-rose-700/80 mt-1">
          You need admin or super-admin privileges to moderate the community.
        </p>
      </div>
    );
  }
  const me = await getMember(user.id);

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
            Admin · community moderation
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Moderate the feed
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          Pin great wins. Hide spam. Delete what shouldn&apos;t live in the cohort. Every action is
          logged.
        </p>
      </header>

      <CommunityClient
        isAdmin
        me={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: me?.avatarUrl || null,
          companyLogoUrl: me?.companyLogoUrl || null,
        }}
      />
    </div>
  );
}
