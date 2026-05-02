import Link from "next/link";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { Bookmark as BookmarkIcon, ArrowRight, Sparkles } from "lucide-react";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Bookmark from "@/models/Bookmark";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import { findLesson, PHASE_THEME } from "@/lib/curriculum";
import { fmtRelative } from "@/lib/utils";
import RemoveBookmarkButton from "./_remove";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const oid = new mongoose.Types.ObjectId(user.id);
  const items = await Bookmark.find({ userId: oid })
    .sort({ createdAt: -1 })
    .lean<{ _id: any; weekSlug: string; lessonSlug: string; title?: string; createdAt: Date }[]>();

  // Pull DB-level lesson metadata + viewer progress in two cheap queries
  const slugs = items.map((b) => ({ weekSlug: b.weekSlug, lessonSlug: b.lessonSlug }));
  const [lessonRows, progressRows] = await Promise.all([
    slugs.length
      ? Lesson.find({
          $or: slugs.map((s) => ({ weekSlug: s.weekSlug, lessonSlug: s.lessonSlug })),
        })
          .select("weekSlug lessonSlug videoProvider durationSeconds isPublished")
          .lean<{ weekSlug: string; lessonSlug: string; videoProvider?: string; durationSeconds?: number; isPublished?: boolean }[]>()
      : [],
    slugs.length
      ? Progress.find({
          userId: oid,
          $or: slugs.map((s) => ({ weekSlug: s.weekSlug, lessonSlug: s.lessonSlug })),
        })
          .select("weekSlug lessonSlug videoCompletedAt quizPassedAt")
          .lean<{ weekSlug: string; lessonSlug: string; videoCompletedAt?: Date; quizPassedAt?: Date }[]>()
      : [],
  ]);

  const lessonMap = new Map(
    lessonRows.map((r) => [`${r.weekSlug}::${r.lessonSlug}`, r])
  );
  const progressMap = new Map(
    progressRows.map((r) => [`${r.weekSlug}::${r.lessonSlug}`, r])
  );

  return (
    <div className="space-y-5">
      <header>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
          <BookmarkIcon className="h-3 w-3" /> Saved for later
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Bookmarks
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {items.length === 0
            ? "Hit the bookmark icon on any lesson to save it here."
            : `${items.length} lesson${items.length === 1 ? "" : "s"} saved.`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <BookmarkIcon className="mx-auto h-7 w-7 text-slate-400" />
          <div className="mt-2 text-sm font-bold text-slate-900">No bookmarks yet.</div>
          <div className="text-xs text-slate-500 mt-1">
            Hit the bookmark icon on any lesson to save it.
          </div>
          <Link
            href="/curriculum"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 h-10 text-sm font-extrabold text-white"
          >
            Browse curriculum
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((b) => {
            const found = findLesson(b.weekSlug, b.lessonSlug);
            const week = found?.week;
            const lesson = found?.lesson;
            const phaseTheme = week ? PHASE_THEME[week.phase] : null;
            const dbLesson = lessonMap.get(`${b.weekSlug}::${b.lessonSlug}`);
            const progress = progressMap.get(`${b.weekSlug}::${b.lessonSlug}`);
            const watched = !!progress?.videoCompletedAt;
            const passed = !!progress?.quizPassedAt;

            return (
              <div
                key={b._id.toString()}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {phaseTheme && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${phaseTheme.chip}`}
                      >
                        {week!.weekIndex + 1}. {phaseTheme.label}
                      </span>
                    )}
                    {passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                        <Sparkles className="h-2.5 w-2.5" />
                        Aced
                      </span>
                    ) : watched ? (
                      <span className="inline-flex items-center rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-700">
                        Watched
                      </span>
                    ) : null}
                  </div>
                  <RemoveBookmarkButton
                    weekSlug={b.weekSlug}
                    lessonSlug={b.lessonSlug}
                  />
                </div>

                <Link
                  href={`/curriculum/${b.weekSlug}/${b.lessonSlug}`}
                  className="block"
                >
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 leading-snug line-clamp-2">
                    {lesson?.title || b.title || b.lessonSlug}
                  </h3>
                  {lesson?.summary && (
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-snug">
                      {lesson.summary}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Saved {fmtRelative(b.createdAt.toString())}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      Open lesson
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  {dbLesson?.isPublished === false && (
                    <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full inline-flex items-center px-2 py-0.5">
                      Coming soon
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
