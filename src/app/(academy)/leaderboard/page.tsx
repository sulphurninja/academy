import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { Trophy, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/engine";
import { levelFromXp } from "@/lib/xp";
import LeaderboardTable from "@/components/academy/LeaderboardTable";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { faviconFor, domainFromEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const rows = await getLeaderboard(50);

  const ids = rows.map((r) => new mongoose.Types.ObjectId(r.userId));
  const [users, companies] = await Promise.all([
    User.find({ _id: { $in: ids } })
      .select("_id companyId email")
      .lean<{ _id: any; companyId?: any; email: string }[]>(),
    Promise.resolve(null),
  ]);
  const companyIds = users.map((u) => u.companyId).filter(Boolean);
  const companyDocs = companyIds.length
    ? await Company.find({ _id: { $in: companyIds } })
        .select("_id name website whatsappProfile")
        .lean<{
          _id: any;
          name?: string;
          website?: string;
          whatsappProfile?: { profilePictureUrl?: string };
        }[]>()
    : [];
  const companyMap = new Map(companyDocs.map((c: any) => [c._id.toString(), c]));
  const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

  const enriched = rows.map((r) => {
    const u = userMap.get(r.userId);
    const c = u?.companyId ? companyMap.get(u.companyId.toString()) : null;
    const domain =
      c?.website?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") ||
      domainFromEmail(r.email);
    return {
      ...r,
      level: levelFromXp(r.xp).level,
      companyName: c?.name,
      avatarUrl: c?.whatsappProfile?.profilePictureUrl || null,
      companyLogoUrl: faviconFor(domain),
    };
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-700">
            <Trophy className="h-3 w-3" />
            Live cohort leaderboard
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Top of the cohort
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Rankings refresh in real-time. Top 3 land the Showdown cash prize.
            Catch a streak, ace quizzes, build live — keep stacking XP.
          </p>
        </div>
        <a
          href={
            (process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io") +
            "/zapacademy/showdown"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-10 rounded-xl px-4 text-[12px] font-extrabold uppercase tracking-widest text-[#1a1100] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 ring-1 ring-amber-300 gold-glow"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Enter Showdown · ₹1,00,000
        </a>
      </header>

      <LeaderboardTable rows={enriched} meId={user.id} />
    </div>
  );
}
