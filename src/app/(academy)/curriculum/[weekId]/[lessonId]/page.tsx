import Link from "next/link";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  MessageCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { findLesson, PHASE_THEME } from "@/lib/curriculum";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import Bookmark from "@/models/Bookmark";
import { LessonClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ weekId: string; lessonId: string }>;
}) {
  const { weekId, lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const found = findLesson(weekId, lessonId);
  if (!found) notFound();
  const { week, lesson } = found;
  const theme = PHASE_THEME[week.phase];

  await dbConnect();
  const [dbLesson, progress, bookmark] = await Promise.all([
    Lesson.findOne({ weekSlug: week.slug, lessonSlug: lesson.slug }).lean<{
      videoUrl?: string;
      videoProvider?: any;
      durationSeconds?: number;
      resources?: { label: string; url: string }[];
      challenge?: string;
      quiz?: any;
      xpVideoComplete?: number;
      isPublished?: boolean;
    }>(),
    Progress.findOne({
      userId: new mongoose.Types.ObjectId(user.id),
      weekSlug: week.slug,
      lessonSlug: lesson.slug,
    }).lean<{
      videoCompletedAt?: Date;
      quizPassedAt?: Date;
      quizPerfectAt?: Date;
      quizBestScore?: number;
      quizAttempts?: number;
    }>(),
    Bookmark.exists({
      userId: new mongoose.Types.ObjectId(user.id),
      weekSlug: week.slug,
      lessonSlug: lesson.slug,
    }),
  ]);

  const idx = week.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? week.lessons[idx - 1] : null;
  const next = idx < week.lessons.length - 1 ? week.lessons[idx + 1] : null;

  // Strip the `correct` field before sending the quiz to the client
  const safeQuiz = dbLesson?.quiz?.questions
    ? {
        passScore: dbLesson.quiz.passScore || 0.7,
        xpOnPass: dbLesson.quiz.xpOnPass || 100,
        xpOnPerfect: dbLesson.quiz.xpOnPerfect || 250,
        questions: (dbLesson.quiz.questions as any[]).map((q) => ({
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          points: q.points,
        })),
      }
    : null;

  return (
    <div className="space-y-6">
      <Link
        href={`/curriculum/${week.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {week.title}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${theme.chip}`}
          >
            Week {week.weekIndex + 1} · Lesson {idx + 1}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 leading-tight">
            {lesson.title}
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            {lesson.summary}
          </p>
        </div>
        {progress?.quizPassedAt && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
            <Trophy className="h-3.5 w-3.5" /> Passed · best {Math.round((progress.quizBestScore || 0) * 100)}%
          </span>
        )}
      </header>

      <LessonClient
        userId={user.id}
        weekSlug={week.slug}
        lessonSlug={lesson.slug}
        title={lesson.title}
        videoUrl={dbLesson?.videoUrl}
        videoProvider={dbLesson?.videoProvider}
        videoCompleted={!!progress?.videoCompletedAt}
        bookmarked={!!bookmark}
        quiz={safeQuiz}
        quizAlreadyPassed={!!progress?.quizPassedAt}
        quizBestScore={progress?.quizBestScore}
        challenge={dbLesson?.challenge || lesson.challenge}
        resources={dbLesson?.resources || []}
      />

      <div className="grid sm:grid-cols-2 gap-3 pt-2">
        {prev ? (
          <Link
            href={`/curriculum/${week.slug}/${prev.slug}`}
            className="rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm p-4 transition-all flex items-center gap-3 group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Previous
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/curriculum/${week.slug}/${next.slug}`}
            className="rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm p-4 transition-all flex items-center gap-3 group justify-end text-right"
          >
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Up next
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">{next.title}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <Link
            href="/curriculum"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-4 transition-colors flex items-center gap-3 group justify-end text-right"
          >
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
                Week complete?
              </div>
              <div className="text-sm font-bold text-emerald-800">Pick the next week →</div>
            </div>
          </Link>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-500">
        <Hint icon={<BookOpen className="h-3.5 w-3.5" />}>
          Watch the lesson to unlock the quiz.
        </Hint>
        <Hint icon={<Sparkles className="h-3.5 w-3.5" />}>
          Pass first try for double XP.
        </Hint>
        <Hint icon={<MessageCircle className="h-3.5 w-3.5" />}>
          Drop a question — comments earn +10 XP.
        </Hint>
      </div>
    </div>
  );
}

function Hint({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center gap-2">
      <span className="text-emerald-700">{icon}</span>
      {children}
    </div>
  );
}
