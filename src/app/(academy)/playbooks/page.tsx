import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Clock, ArrowRight, CheckCircle2, Video } from "lucide-react";
import { WEEKS, PHASE_THEME } from "@/lib/curriculum";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import mongoose from "mongoose";
import Progress from "@/models/Progress";

export const dynamic = "force-dynamic";

export default async function GuidesHub() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();

  const lessons = await Lesson.find({ content: { $exists: true, $ne: "" } })
    .select("weekSlug lessonSlug title readingTimeMinutes")
    .lean<{ weekSlug: string; lessonSlug: string; title: string; readingTimeMinutes?: number }[]>();

  const lessonMap = new Map(lessons.map((l) => [`${l.weekSlug}:${l.lessonSlug}`, l]));

  const progresses = await Progress.find({
    userId: new mongoose.Types.ObjectId(user.id),
  })
    .select("weekSlug lessonSlug videoCompletedAt")
    .lean<{ weekSlug: string; lessonSlug: string; videoCompletedAt?: Date }[]>();

  const completedSet = new Set(
    progresses.filter((p) => p.videoCompletedAt).map((p) => `${p.weekSlug}:${p.lessonSlug}`)
  );

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Playbooks
            </h1>
            <p className="text-sm text-slate-500">
              Battle-tested playbooks for every lesson. Read, apply, dominate.
            </p>
          </div>
        </div>
      </header>

      {WEEKS.map((week) => {
        const theme = PHASE_THEME[week.phase];
        const weekLessons = week.lessons.filter((l) =>
          lessonMap.has(`${week.slug}:${l.slug}`)
        );
        if (weekLessons.length === 0) return null;

        return (
          <section key={week.slug}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${theme.chip}`}
              >
                {week.label}
              </span>
              <h2 className="text-lg font-black text-slate-900">{week.title}</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {weekLessons.map((lesson) => {
                const db = lessonMap.get(`${week.slug}:${lesson.slug}`);
                const done = completedSet.has(`${week.slug}:${lesson.slug}`);
                return (
                  <Link
                    key={lesson.slug}
                    href={`/playbooks/${week.slug}/${lesson.slug}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {lesson.title}
                      </h3>
                      {done && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                      {lesson.summary}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 text-slate-400 font-bold">
                        <Clock className="h-3 w-3" />
                        {db?.readingTimeMinutes || 5} min read
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold group-hover:gap-2 transition-all">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
