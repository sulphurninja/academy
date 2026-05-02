import Link from "next/link";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { findWeek, PHASE_THEME } from "@/lib/curriculum";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import Lesson from "@/models/Lesson";

export const dynamic = "force-dynamic";

export default async function WeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const week = findWeek(weekId);
  if (!week) notFound();

  await dbConnect();
  const [progressRows, dbLessons] = await Promise.all([
    Progress.find({ userId: new mongoose.Types.ObjectId(user.id), weekSlug: week.slug }).lean<{
      lessonSlug: string;
      videoCompletedAt?: Date;
      quizPassedAt?: Date;
    }[]>(),
    Lesson.find({ weekSlug: week.slug, isPublished: true })
      .select("lessonSlug videoUrl durationSeconds")
      .lean<{ lessonSlug: string; videoUrl?: string; durationSeconds?: number }[]>(),
  ]);
  const dbBySlug = new Map(dbLessons.map((l) => [l.lessonSlug, l]));
  const theme = PHASE_THEME[week.phase];
  const passedCount = progressRows.filter((p) => p.quizPassedAt).length;
  const pct = Math.round((passedCount / Math.max(1, week.lessons.length)) * 100);

  return (
    <div className="space-y-6">
      <Link
        href="/curriculum"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All weeks
      </Link>

      <header className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-emerald opacity-30 pointer-events-none" />
        <div className="relative grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${theme.chip}`}
            >
              Week {week.weekIndex + 1} · {theme.label}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              {week.title}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {week.outcome}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Week stats
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <PlayCircle className="h-3.5 w-3.5" /> Lessons
                </span>
                <span className="font-bold">{week.lessons.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Time
                </span>
                <span className="font-bold">~{week.hours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                </span>
                <span className="font-bold text-emerald-700">
                  {passedCount}/{week.lessons.length}
                </span>
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <ol className="space-y-3">
        {week.lessons.map((lesson, i) => {
          const p = progressRows.find((r) => r.lessonSlug === lesson.slug);
          const passed = !!p?.quizPassedAt;
          const watched = !!p?.videoCompletedAt;
          const dbLesson = dbBySlug.get(lesson.slug);
          const live = !!dbLesson?.videoUrl;

          // Sequential gating — lesson is locked until previous one's video is watched
          const prev = i > 0 ? week.lessons[i - 1] : null;
          const prevP = prev
            ? progressRows.find((r) => r.lessonSlug === prev.slug)
            : null;
          const locked = i > 0 && !prevP?.videoCompletedAt;

          return (
            <li
              key={lesson.slug}
              className={`group rounded-2xl border bg-white transition-all ${
                passed
                  ? "border-emerald-200 bg-emerald-50/40"
                  : locked
                  ? "border-slate-200 opacity-70"
                  : "border-slate-200 hover:border-emerald-200 hover:shadow-sm"
              }`}
            >
              <Link
                href={locked ? "#" : `/curriculum/${week.slug}/${lesson.slug}`}
                className={locked ? "pointer-events-none" : ""}
              >
                <div className="flex items-start gap-4 p-4 sm:p-5">
                  <div
                    className={`shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${
                      passed
                        ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                        : locked
                        ? "bg-slate-50 border-slate-200 text-slate-400"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    {locked ? (
                      <Lock className="h-4 w-4" />
                    ) : passed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                        Lesson {i + 1}
                      </span>
                      {live ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                          <Sparkles className="h-2.5 w-2.5" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Coming soon
                        </span>
                      )}
                      {watched && !passed && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-bold uppercase tracking-widest text-amber-700">
                          Quiz pending
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {lesson.summary}
                    </p>
                  </div>
                  <ArrowRight className="hidden sm:block h-4 w-4 text-slate-400 mt-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
