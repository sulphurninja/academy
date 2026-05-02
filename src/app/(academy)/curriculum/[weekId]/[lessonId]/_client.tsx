"use client";

import { useState } from "react";
import {
  ExternalLink,
  FileText,
  MessageCircle,
  Sparkles,
  Wrench,
  StickyNote,
  Bookmark,
  Share2,
  CheckCircle2,
} from "lucide-react";
import VideoPlayer, { VideoActions } from "@/components/academy/VideoPlayer";
import QuizPanel, { type QuizSummary } from "@/components/academy/QuizPanel";
import CommentThread from "@/components/academy/CommentThread";
import { cn } from "@/lib/utils";

type Tab = "quiz" | "comments" | "challenge" | "resources" | "notes";

interface Props {
  userId: string;
  weekSlug: string;
  lessonSlug: string;
  title: string;
  videoUrl?: string;
  videoProvider?: "youtube" | "vimeo" | "mp4" | "hls" | string;
  videoCompleted: boolean;
  bookmarked?: boolean;
  quiz: QuizSummary | null;
  quizAlreadyPassed: boolean;
  quizBestScore?: number;
  challenge?: string;
  resources: { label: string; url: string }[];
}

export function LessonClient(props: Props) {
  const [tab, setTab] = useState<Tab>("quiz");
  const [completed, setCompleted] = useState(props.videoCompleted);
  const [savedNote, setSavedNote] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  const onVideoComplete = async () => {
    if (completed) return;
    setCompleted(true);
    try {
      await fetch("/api/me/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekSlug: props.weekSlug,
          lessonSlug: props.lessonSlug,
          videoCompleted: true,
        }),
      });
    } catch {
      /* swallow */
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "quiz", label: "Quiz", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ...(props.challenge
      ? [{ id: "challenge" as Tab, label: "Challenge", icon: <Wrench className="h-3.5 w-3.5" /> }]
      : []),
    { id: "comments", label: "Discussion", icon: <MessageCircle className="h-3.5 w-3.5" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="h-3.5 w-3.5" /> },
    ...(props.resources.length
      ? [{ id: "resources" as Tab, label: "Resources", icon: <FileText className="h-3.5 w-3.5" /> }]
      : []),
  ];

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-4">
        <VideoPlayer
          url={props.videoUrl}
          provider={props.videoProvider}
          completed={completed}
          onComplete={onVideoComplete}
        />
        <VideoActions
          weekSlug={props.weekSlug}
          lessonSlug={props.lessonSlug}
          title={props.title}
          initialBookmarked={!!props.bookmarked}
          onAddNote={() => setTab("notes")}
        />

        {!props.videoUrl && (
          <button
            onClick={onVideoComplete}
            className="text-[11px] text-slate-500 hover:text-slate-700 underline-offset-4 hover:underline"
          >
            Pretend-mark video as watched (dev only) →
          </button>
        )}

        {/* Lesson summary card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Lesson summary
            </h4>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Take 2 minutes to jot down your one-line takeaway in <strong>Notes</strong>. Then drop a
            question in <strong>Discussion</strong> — comments earn +10 XP.
          </p>
          <div className="mt-3 flex items-center gap-2">
            {completed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Video watched
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                Watch ≥ 90% to unlock the quiz
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator
                    .share({ title: props.title, url: window.location.href })
                    .catch(() => {});
                } else if (typeof navigator !== "undefined") {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto scrollbar-soft">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors",
                  tab === t.id
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto scrollbar-soft">
            {tab === "quiz" &&
              (props.quiz && props.quiz.questions.length > 0 ? (
                <QuizPanel
                  weekSlug={props.weekSlug}
                  lessonSlug={props.lessonSlug}
                  quiz={props.quiz}
                  videoCompleted={completed}
                  alreadyPassed={props.quizAlreadyPassed}
                  bestScore={props.quizBestScore}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-bold text-slate-900">Quiz coming soon</p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Your founder will publish the quiz before the cohort starts. Check back soon.
                  </p>
                </div>
              ))}

            {tab === "challenge" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-4 w-4 text-amber-600" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700">
                      Interactive challenge · {props.challenge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Build it. Earn +400 XP.</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    This lesson has a hands-on build. In the next drop we&apos;ll render the actual Zaptick
                    surface (workflow builder, broadcast composer, AI agent brief, …) right here, validate
                    your work, and award XP automatically.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Coming soon
                  </div>
                </div>
              </div>
            )}

            {tab === "comments" && (
              <CommentThread
                weekSlug={props.weekSlug}
                lessonSlug={props.lessonSlug}
                currentUserId={props.userId}
              />
            )}

            {tab === "notes" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Personal notes for this lesson. Saved locally to your browser — encrypted cloud notes
                  ship in v2.
                </p>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="One-line takeaway, copy ideas, screenshots URLs, etc."
                  rows={6}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem(
                          `zap-academy-note:${props.weekSlug}:${props.lessonSlug}`,
                          noteDraft
                        );
                        setSavedNote(noteDraft);
                      } catch {}
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    <Bookmark className="h-3.5 w-3.5" /> Save note
                  </button>
                </div>
                {savedNote && (
                  <div className="text-[11px] text-emerald-700 font-bold">Saved.</div>
                )}
              </div>
            )}

            {tab === "resources" && (
              <div className="space-y-2">
                {props.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 px-3 py-2.5 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span className="text-sm text-slate-900 flex-1 truncate font-semibold">{r.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
