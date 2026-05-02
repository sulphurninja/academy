import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  PlayCircle,
  Award,
  CheckCircle2,
  Crown,
  Target,
  Map as MapIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTotalXp, getLeaderboard } from "@/lib/engine";
import { getMember, listMembers } from "@/lib/profile";
import { CURRICULUM, totalLessons, PHASE_THEME } from "@/lib/curriculum";
import { levelFromXp, XP_REWARDS, ARENA_LEVELS } from "@/lib/xp";
import { fmtNumber, faviconFor, domainFromEmail } from "@/lib/utils";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import BadgeEarned from "@/models/BadgeEarned";
import Streak from "@/models/Streak";
import Post from "@/models/Post";
import User from "@/models/User";
import Company from "@/models/Company";
import mongoose from "mongoose";
import { BADGES, TIER_STYLE } from "@/lib/badges";
import XpBar from "@/components/academy/XpBar";
import StreakFlame from "@/components/academy/StreakFlame";
import LeaderboardTable from "@/components/academy/LeaderboardTable";
import SuggestedMembers from "@/components/academy/SuggestedMembers";
import DailyChallenges from "@/components/academy/DailyChallenges";
import ShareableProgress from "@/components/academy/ShareableProgress";
import { Avatar } from "@/components/ui/avatar";
import Follow from "@/models/Follow";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await dbConnect();

  const me = new mongoose.Types.ObjectId(user.id);

  const [
    xp,
    progressRows,
    earnedBadges,
    streak,
    leaderboardRaw,
    suggested,
    feedRows,
    follows,
  ] = await Promise.all([
    getTotalXp(user.id),
    Progress.find({ userId: me }).select("weekSlug lessonSlug videoCompletedAt quizPassedAt").lean<{
      weekSlug: string;
      lessonSlug: string;
      videoCompletedAt?: Date;
      quizPassedAt?: Date;
    }[]>(),
    BadgeEarned.find({ userId: me }).select("badgeId").lean<{ badgeId: string }[]>(),
    Streak.findOne({ userId: me }).lean<{ current: number; longest: number }>(),
    getLeaderboard(8),
    listMembers({ viewerId: user.id, limit: 6, excludeIds: [user.id] }),
    Post.find({ isHidden: { $ne: true } })
      .sort({ _id: -1 })
      .limit(3)
      .lean<{
        _id: any;
        body: string;
        userId: any;
        createdAt: Date;
      }[]>(),
    Follow.countDocuments({ followerId: me }),
  ]);

  const level = levelFromXp(xp);
  const totalLessonsCount = totalLessons();
  const passedCount = progressRows.filter((p) => p.quizPassedAt).length;
  const watchedCount = progressRows.filter((p) => p.videoCompletedAt).length;
  const completionPct = totalLessonsCount === 0 ? 0 : Math.round((passedCount / totalLessonsCount) * 100);

  const earnedSet = new Set(earnedBadges.map((b) => b.badgeId));
  const earnedDefs = BADGES.filter((b) => earnedSet.has(b.id)).slice(0, 4);

  // First incomplete lesson — "Continue learning"
  const watchedSet = new Set(progressRows.filter((p) => p.videoCompletedAt).map((p) => `${p.weekSlug}/${p.lessonSlug}`));
  let nextLesson: { weekSlug: string; weekTitle: string; lesson: any; phase: any } | null = null;
  for (const week of CURRICULUM) {
    for (const lesson of week.lessons) {
      const key = `${week.slug}/${lesson.slug}`;
      if (!watchedSet.has(key)) {
        nextLesson = { weekSlug: week.slug, weekTitle: week.title, lesson, phase: week.phase };
        break;
      }
    }
    if (nextLesson) break;
  }

  // Enrich leaderboard with company info for nicer rendering
  const lbUserIds = leaderboardRaw.map((r) => new mongoose.Types.ObjectId(r.userId));
  const lbUsers = lbUserIds.length
    ? await User.find({ _id: { $in: lbUserIds } })
        .select("_id companyId email")
        .lean<{ _id: any; companyId?: any; email: string }[]>()
    : [];
  const lbCompanyIds = lbUsers.map((u) => u.companyId).filter(Boolean);
  const lbCompanies = lbCompanyIds.length
    ? await Company.find({ _id: { $in: lbCompanyIds } })
        .select("_id name website whatsappProfile")
        .lean<{
          _id: any;
          name?: string;
          website?: string;
          whatsappProfile?: { profilePictureUrl?: string };
        }[]>()
    : [];
  const lbCompanyMap = new Map(lbCompanies.map((c: any) => [c._id.toString(), c]));
  const lbUserMap = new Map(lbUsers.map((u: any) => [u._id.toString(), u]));
  const leaderboard = leaderboardRaw.map((r) => {
    const u = lbUserMap.get(r.userId);
    const c = u?.companyId ? lbCompanyMap.get(u.companyId.toString()) : null;
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

  // Recent feed snippet — author info enriched with company avatar
  const feedAuthors = feedRows.length
    ? await User.find({ _id: { $in: feedRows.map((f) => f.userId) } })
        .select("_id name email companyId")
        .lean<{ _id: any; name: string; email: string; companyId?: any }[]>()
    : [];
  const feedCompanyIds = feedAuthors.map((u: any) => u.companyId).filter(Boolean);
  const feedCompanies = feedCompanyIds.length
    ? await Company.find({ _id: { $in: feedCompanyIds } })
        .select("_id whatsappProfile")
        .lean<{ _id: any; whatsappProfile?: { profilePictureUrl?: string } }[]>()
    : [];
  const feedCompanyMap = new Map(feedCompanies.map((c: any) => [c._id.toString(), c]));
  const feedAuthorMap = new Map(
    feedAuthors.map((u: any) => [
      u._id.toString(),
      {
        ...u,
        avatarUrl: u.companyId
          ? feedCompanyMap.get(u.companyId.toString())?.whatsappProfile?.profilePictureUrl || null
          : null,
      },
    ])
  );

  return (
    <div className="space-y-6">
      {/* Greeting hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 lg:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-50 bg-grid-emerald"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Cohort #001 · Live
            </div>
            <h1 className="mt-3 text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              Welcome back, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-slate-600 max-w-xl text-[15px] leading-relaxed">
              You&apos;re a <span className="font-bold text-emerald-700">{level.title}</span> ·
              Level {level.level} · {fmtNumber(xp)} XP earned. Today&apos;s
              the day — finish one more lesson and stack +{XP_REWARDS.videoComplete}{" "}
              XP.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {nextLesson ? (
                <Link
                  href={`/curriculum/${nextLesson.weekSlug}/${nextLesson.lesson.slug}`}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-emerald-600 text-white font-bold shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700 transition"
                >
                  <PlayCircle className="h-4 w-4" />
                  Continue · {nextLesson.lesson.title}
                </Link>
              ) : (
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start the curriculum
                </Link>
              )}
              <Link
                href="/community"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                Drop a post in community
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={
                  (process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io") +
                  "/zapacademy/showdown"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[#1a1100] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 ring-1 ring-amber-300 font-extrabold gold-glow"
              >
                <Crown className="h-4 w-4" />
                Showdown · ₹1L
              </a>
            </div>
          </div>

          <div className="lg:w-[360px] grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <XpBar xp={xp} level={level} />
            </div>
            <StreakFlame current={streak?.current || 0} longest={streak?.longest} />
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Following
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {fmtNumber(follows)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Build your founder network
              </div>
            </div>
            <div className="col-span-2">
              <ShareableProgress
                data={{
                  name: user.name,
                  level: level.level,
                  levelTitle: level.title,
                  xp,
                  streak: streak?.current || 0,
                  lessonsCompleted: watchedCount,
                  totalLessons: totalLessonsCount,
                  badges: earnedBadges.length,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Lessons completed"
          value={`${passedCount}/${totalLessonsCount}`}
          accent="text-emerald-700"
          hint={`${completionPct}% of curriculum`}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Videos watched"
          value={fmtNumber(watchedCount)}
          accent="text-cyan-700"
          hint="Keep the momentum"
          icon={<PlayCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Badges earned"
          value={`${earnedDefs.length}/${BADGES.length}`}
          accent="text-amber-700"
          hint={
            BADGES.length === earnedDefs.length
              ? "Full set 🎉"
              : `${BADGES.length - earnedDefs.length} to go`
          }
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          label="Streak record"
          value={`${streak?.longest || 0}d`}
          accent="text-rose-700"
          hint="Best login streak"
          icon={<Flame className="h-4 w-4" />}
        />
      </section>

      <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6">
        <div className="space-y-6">
          {/* Continue learning + week progress */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900">
                Your 8-week game plan
              </h2>
              <Link
                href="/curriculum"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                Open curriculum <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="space-y-2.5">
              {CURRICULUM.slice(0, 5).map((wk) => {
                const total = wk.lessons.length;
                const done = progressRows.filter(
                  (p) => p.weekSlug === wk.slug && p.quizPassedAt
                ).length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                const theme = PHASE_THEME[wk.phase];
                return (
                  <li
                    key={wk.slug}
                    className="rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-200 transition"
                  >
                    <Link
                      href={`/curriculum/${wk.slug}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border font-extrabold text-xs ${theme.chip}`}
                        >
                          {wk.weekIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {wk.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {done}/{total} lessons · {theme.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 tabular-nums w-9 text-right">
                          {pct}%
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Daily Challenges */}
          <DailyChallenges />

          {/* Suggested members */}
          <SuggestedMembers initial={suggested.members} limit={6} />

          {/* Latest community */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900">
                Latest from the community
              </h2>
              <Link
                href="/community"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                Open feed <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {feedRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <div className="text-sm font-semibold text-slate-700">
                  Be the first to drop a post.
                </div>
                <Link
                  href="/community"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Compose a post <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {feedRows.map((p) => {
                  const a = feedAuthorMap.get(p.userId.toString());
                  return (
                    <li
                      key={p._id.toString()}
                      className="rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-200"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar
                          name={a?.name}
                          email={a?.email}
                          src={a?.avatarUrl || undefined}
                          size={28}
                        />
                        <div className="text-xs font-bold text-slate-900">
                          {a?.name || "Member"}
                        </div>
                      </div>
                      <div className="text-sm text-slate-700 line-clamp-3">{p.body}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Mini leaderboard */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-600">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">Top of cohort</h3>
              </div>
              <Link href="/leaderboard" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                See all →
              </Link>
            </div>
            <LeaderboardTable rows={leaderboard.slice(0, 6)} meId={user.id} />
          </section>

          {/* Recent badges */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700">
                  <Award className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">Recent badges</h3>
              </div>
              <Link href="/badges" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                See all →
              </Link>
            </div>
            {earnedDefs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
                <div className="text-2xl">🎯</div>
                <div className="text-xs text-slate-500 mt-1">
                  Complete a lesson to earn your first badge.
                </div>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-2">
                {earnedDefs.map((b) => {
                  const t = TIER_STYLE[b.tier];
                  return (
                    <li
                      key={b.id}
                      className={`rounded-xl bg-gradient-to-br border ring-2 ${t.ring} ${t.bg} p-3 text-center`}
                    >
                      <div className="text-2xl">{b.emoji}</div>
                      <div className="text-[11px] font-bold text-slate-800 mt-1 line-clamp-1">
                        {b.name}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-[11px] uppercase tracking-widest font-bold text-amber-700">
                Daily quest
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              Pass any quiz today &middot; +{XP_REWARDS.quizPass} XP
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Quests refresh at midnight. Stack streak XP to keep the flame
              alive.
            </p>
            <Link
              href={nextLesson ? `/curriculum/${nextLesson.weekSlug}/${nextLesson.lesson.slug}` : "/curriculum"}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Take a quiz now <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          {/* Level arena preview */}
          <Link
            href="/levels"
            className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                <MapIcon className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Level arenas
              </h3>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 ml-auto group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {ARENA_LEVELS.slice(0, 5).map((a) => {
                const reached = level.level >= a.level;
                return (
                  <div
                    key={a.level}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors ${
                      reached
                        ? "border-emerald-200 bg-emerald-50/60 text-slate-900"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.title}</span>
                  </div>
                );
              })}
              <span className="text-[11px] text-slate-400 font-bold">
                +{ARENA_LEVELS.length - 5} more
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Unlock credits, partner discounts, and exclusive perks as you level up.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  hint,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
          {label}
        </div>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-50 text-slate-400">
          {icon}
        </span>
      </div>
      <div className={`mt-1.5 text-2xl font-black ${accent}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{hint}</div>
    </div>
  );
}
