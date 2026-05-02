import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { Award, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BadgeEarned from "@/models/BadgeEarned";
import { BADGES } from "@/lib/badges";
import BadgeCard from "@/components/academy/BadgeCard";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const earned = await BadgeEarned.find({
    userId: new mongoose.Types.ObjectId(user.id),
  })
    .select("badgeId")
    .lean<{ badgeId: string }[]>();
  const earnedSet = new Set(earned.map((b) => b.badgeId));
  const earnedDefs = BADGES.filter((b) => earnedSet.has(b.id));
  const lockedDefs = BADGES.filter((b) => !earnedSet.has(b.id));

  return (
    <div className="space-y-8">
      <header>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
          <Award className="h-3 w-3" /> Your gallery
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Badges &amp; trophies
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Stack achievements across the curriculum, streaks, the Showdown, and
          beyond. Show them off on your profile and on socials.
        </p>
      </header>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">
            Earned · {earnedDefs.length} / {BADGES.length}
          </h2>
        </div>
        {earnedDefs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-emerald-500" />
            <div className="mt-2 text-sm font-bold text-slate-900">No badges yet</div>
            <div className="text-xs text-slate-500 mt-1">
              Complete a lesson, ace a quiz, or hit a 7-day streak to unlock your first one.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {earnedDefs.map((b) => (
              <BadgeCard key={b.id} def={b} earned />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">
            Locked · keep building
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {lockedDefs.map((b) => (
            <BadgeCard key={b.id} def={b} earned={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
