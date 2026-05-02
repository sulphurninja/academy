import Link from "next/link";
import mongoose from "mongoose";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { CURRICULUM, totalLessons, PHASE_THEME } from "@/lib/curriculum";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const progressRows = await Progress.find({
    userId: new mongoose.Types.ObjectId(user.id),
  })
    .select("weekSlug lessonSlug videoCompletedAt quizPassedAt")
    .lean<{ weekSlug: string; lessonSlug: string; videoCompletedAt?: Date; quizPassedAt?: Date }[]>();

  const passedCount = progressRows.filter((p) => p.quizPassedAt).length;
  const totalCount = totalLessons();
  const overallPct = totalCount === 0 ? 0 : Math.round((passedCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
            <BookOpen className="h-3 w-3" />
            8-week curriculum
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Your path to a ₹1 Cr/yr AI marketing agency
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Each week unlocks the next. Pass the quiz at the end of every lesson
            to climb the ladder. Land in the top 3 of the cohort and you bag
            the Showdown cash prize.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:min-w-[280px]">
          <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
            Curriculum progress
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{overallPct}%</span>
            <span className="text-xs text-slate-500">
              {passedCount} / {totalCount} lessons aced
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </header>

      <ul className="space-y-3">
        {CURRICULUM.map((week, i) => {
          const total = week.lessons.length;
          const done = progressRows.filter(
            (p) => p.weekSlug === week.slug && p.quizPassedAt
          ).length;
          const watched = progressRows.filter(
            (p) => p.weekSlug === week.slug && p.videoCompletedAt
          ).length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          const theme = PHASE_THEME[week.phase];

          // Sequential gating — week unlocks once previous week's quizzes are passed
          const prev = CURRICULUM[i - 1];
          let locked = false;
          if (prev) {
            const prevPassed = progressRows.filter(
              (p) => p.weekSlug === prev.slug && p.quizPassedAt
            ).length;
            locked = prevPassed < prev.lessons.length;
          }

          const totalMinutes = week.hours * 60;

          return (
            <li
              key={week.slug}
              className={`group rounded-2xl border bg-white p-5 transition-all ${
                locked
                  ? "border-slate-200 opacity-70"
                  : "border-slate-200 hover:border-emerald-200 hover:shadow-sm"
              }`}
            >
              <Link
                href={locked ? "#" : `/curriculum/${week.slug}`}
                aria-disabled={locked}
                className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5"
              >
                <div className="flex items-center gap-3 lg:w-72 shrink-0">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border font-black text-base ${theme.chip}`}
                  >
                    {week.weekIndex + 1}
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Week {week.weekIndex + 1} · {theme.label}
                    </div>
                    <div className="text-base font-extrabold text-slate-900">{week.title}</div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl">
                    {week.outcome}
                  </p>
                  <div className="mt-2 flex items-center flex-wrap gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {total} lessons
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{Math.round(totalMinutes / 60)}h to finish
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      {done}/{total} passed · {watched}/{total} watched
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:w-60 shrink-0">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 tabular-nums w-9 text-right">
                    {pct}%
                  </span>
                  {locked ? (
                    <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-emerald-700 shrink-0 transition-transform group-hover:translate-x-1" />
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
