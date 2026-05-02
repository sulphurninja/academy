import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Megaphone, ShieldAlert } from "lucide-react";
import AnnouncementsClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
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
          You need admin or super-admin privileges on the main Zaptick app to send announcements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="h-4 w-4 text-emerald-700" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
            Admin · announcements
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Send a cohort-wide announcement
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          Fans out an in-app notification to every active member. Use sparingly — for new lesson
          drops, cohort calls, Showdown deadlines, and product news.
        </p>
      </header>
      <AnnouncementsClient />
    </div>
  );
}
