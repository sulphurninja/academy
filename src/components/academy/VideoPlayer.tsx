"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Maximize2, BookmarkPlus, BookmarkCheck, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  url?: string | null;
  provider?: "youtube" | "vimeo" | "mp4" | "hls" | "url" | string;
  poster?: string;
  onComplete?: () => void;
  /** Called every 5s as the video plays — used by parent to upsert progress. */
  onProgress?: (pctWatched: number) => void;
  /** When true, parent has already accepted the watch event. */
  completed?: boolean;
}

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/embed\/([^/?#]+)/);
    if (m) return m[1];
    const s = u.pathname.match(/\/shorts\/([^/?#]+)/);
    if (s) return s[1];
  } catch {}
  return null;
}

function vimeoIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({
  url,
  provider,
  poster,
  onComplete,
  onProgress,
  completed,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasFiredComplete, setHasFiredComplete] = useState(!!completed);

  useEffect(() => {
    setHasFiredComplete(!!completed);
  }, [completed]);

  if (!url) {
    return (
      <div className="aspect-video w-full rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Play className="mx-auto h-9 w-9 mb-2" />
          <div className="text-sm font-medium">Lesson uploads soon</div>
          <div className="text-xs text-slate-400 mt-1">
            Your cohort lead will publish this lesson in the next drop.
          </div>
        </div>
      </div>
    );
  }

  if (provider === "youtube" || (typeof url === "string" && /youtu\.?be/.test(url))) {
    const id = youtubeIdFromUrl(url);
    if (id) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          <iframe
            src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Lesson video"
          />
        </div>
      );
    }
  }

  if (provider === "vimeo" || (typeof url === "string" && /vimeo\.com/.test(url))) {
    const id = vimeoIdFromUrl(url);
    if (id) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          <iframe
            src={`https://player.vimeo.com/video/${id}`}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Lesson video"
          />
        </div>
      );
    }
  }

  // direct mp4 / hls — native <video>
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        className="h-full w-full"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration) return;
          const pct = el.currentTime / el.duration;
          onProgress?.(pct);
          if (pct >= 0.9 && !hasFiredComplete) {
            setHasFiredComplete(true);
            onComplete?.();
          }
        }}
      >
        <source src={url} />
        Your browser doesn&apos;t support video playback.
      </video>
      <div className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-700 backdrop-blur">
        <Maximize2 className="h-3 w-3" /> HD
      </div>
    </div>
  );
}

/**
 * Inline action strip below the video.
 * - Bookmark toggles via /api/bookmarks (lesson scope).
 * - Note button switches the parent's tab (caller-controlled).
 */
export function VideoActions({
  weekSlug,
  lessonSlug,
  title,
  initialBookmarked = false,
  onAddNote,
}: {
  weekSlug: string;
  lessonSlug: string;
  title?: string;
  initialBookmarked?: boolean;
  onAddNote?: () => void;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !bookmarked;
    setBookmarked(next); // optimistic
    try {
      const r = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, lessonSlug, title }),
      });
      const j = await r.json();
      if (typeof j?.bookmarked === "boolean") setBookmarked(j.bookmarked);
    } catch {
      setBookmarked(!next); // revert
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60",
          bookmarked
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
        )}
      >
        {bookmarked ? (
          <>
            <BookmarkCheck className="h-3.5 w-3.5" />
            Bookmarked
          </>
        ) : (
          <>
            <BookmarkPlus className="h-3.5 w-3.5" />
            Bookmark
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onAddNote}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
      >
        <StickyNote className="h-3.5 w-3.5" />
        Add note
      </button>
    </div>
  );
}
