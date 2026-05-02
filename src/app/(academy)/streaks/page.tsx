import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { Flame, Calendar, Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Streak from "@/models/Streak";
import StreakFlame from "@/components/academy/StreakFlame";
import { XP_REWARDS } from "@/lib/xp";
import { fmtNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StreaksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const s = await Streak.findOne({
    userId: new mongoose.Types.ObjectId(user.id),
  }).lean<{ current: number; longest: number; lastActiveDay: string }>();

  const current = s?.current || 0;
  const longest = s?.longest || 0;

  const milestones = [
    { days: 3, xp: XP_REWARDS.dailyLogin * 3, label: "Spark" },
    { days: 7, xp: XP_REWARDS.streak7, label: "On Fire" },
    { days: 14, xp: 700, label: "Two-week tear" },
    { days: 30, xp: XP_REWARDS.streak30, label: "Unstoppable" },
    { days: 60, xp: 3000, label: "Inferno" },
  ];

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-700">
              <Flame className="h-3 w-3" />
              Daily streak
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Keep the flame alive.
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-xl">
              Sign in every day to keep your streak burning. Hit milestone days
              and stack massive XP boosts.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StreakFlame current={current} longest={longest} />
          </div>
        </div>
      </header>

      <section className="grid sm:grid-cols-3 gap-3">
        <Card label="Current streak" value={`${current}d`} icon={<Flame className="h-4 w-4" />} accent="text-amber-700" />
        <Card label="Best streak" value={`${longest}d`} icon={<Calendar className="h-4 w-4" />} accent="text-emerald-700" />
        <Card label="Daily login XP" value={`+${XP_REWARDS.dailyLogin}`} icon={<Target className="h-4 w-4" />} accent="text-cyan-700" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-4">
          Streak milestones
        </h2>
        <ul className="space-y-2.5">
          {milestones.map((m) => {
            const reached = current >= m.days || longest >= m.days;
            const pct = Math.min(100, Math.round((current / m.days) * 100));
            return (
              <li
                key={m.days}
                className={`rounded-xl border px-4 py-3 ${
                  reached
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border font-extrabold text-sm ${
                        reached
                          ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {m.days}d
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{m.label}</div>
                      <div className="text-[11px] text-slate-500">+{fmtNumber(m.xp)} XP boost</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-slate-500">
                    {reached ? "Done" : `${pct}%`}
                  </span>
                </div>
                {!reached && (
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{label}</div>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-50 text-slate-400">
          {icon}
        </span>
      </div>
      <div className={`mt-1.5 text-3xl font-black ${accent}`}>{value}</div>
    </div>
  );
}
