import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Video,
  Clock,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import { findLesson, PHASE_THEME } from "@/lib/curriculum";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import GuideRenderer from "@/components/academy/GuideRenderer";

export const dynamic = "force-dynamic";

export default async function GuidePage({
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
  const dbLesson = await Lesson.findOne({
    weekSlug: week.slug,
    lessonSlug: lesson.slug,
  }).lean<{
    content?: string;
    readingTimeMinutes?: number;
    videoUrl?: string;
  }>();

  if (!dbLesson?.content) notFound();

  const idx = week.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? week.lessons[idx - 1] : null;
  const next = idx < week.lessons.length - 1 ? week.lessons[idx + 1] : null;

  const readTime = dbLesson.readingTimeMinutes || Math.ceil((dbLesson.content?.length || 0) / 1200);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/guides" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold">
          <ArrowLeft className="h-3.5 w-3.5" /> Guides
        </Link>
        <span className="text-slate-300">/</span>
        <Link href={`/curriculum/${week.slug}`} className="text-slate-500 hover:text-slate-700 font-bold">
          {week.title}
        </Link>
      </div>

      {/* Hero header */}
      <header className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${theme.chip}`}>
            Week {week.weekIndex + 1} · Lesson {idx + 1}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            <BookOpen className="h-3 w-3" /> Written Guide
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500">
            <Clock className="h-3 w-3" /> {readTime} min read
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {lesson.title}
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
          {lesson.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {dbLesson.videoUrl && (
            <Link
              href={`/curriculum/${week.slug}/${lesson.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Video className="h-4 w-4" />
              Watch the video lesson
            </Link>
          )}
          {!dbLesson.videoUrl && (
            <Link
              href={`/curriculum/${week.slug}/${lesson.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
            >
              <Video className="h-4 w-4" />
              Go to video lesson
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
        <GuideRenderer content={dbLesson.content} />
      </article>

      {/* Discussion CTA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            Join the discussion
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Got questions? Head to the video lesson page to discuss with the community and earn +10 XP.
          </p>
        </div>
        <Link
          href={`/curriculum/${week.slug}/${lesson.slug}`}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shrink-0"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Open discussion
        </Link>
      </div>

      {/* Nav */}
      <div className="grid sm:grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/guides/${week.slug}/${prev.slug}`}
            className="rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm p-4 transition-all flex items-center gap-3 group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Previous</div>
              <div className="text-sm font-bold text-slate-900 truncate">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/guides/${week.slug}/${next.slug}`}
            className="rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm p-4 transition-all flex items-center gap-3 group justify-end text-right"
          >
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Up next</div>
              <div className="text-sm font-bold text-slate-900 truncate">{next.title}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <Link
            href="/guides"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-4 transition-colors flex items-center gap-3 justify-end text-right"
          >
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">Done!</div>
              <div className="text-sm font-bold text-emerald-800">Back to all guides →</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
