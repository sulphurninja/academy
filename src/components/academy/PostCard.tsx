"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Pin,
  Trash2,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  PiLinkedinLogoFill,
  PiTwitterLogoFill,
  PiInstagramLogoFill,
  PiYoutubeLogoFill,
  PiLinkSimpleBold,
} from "react-icons/pi";
import { Avatar } from "@/components/ui/avatar";
import { fmtRelative, shortNumber, cn } from "@/lib/utils";

export interface PostCardProps {
  post: {
    id: string;
    body: string;
    attachment: {
      url: string;
      type?: string;
      title?: string;
      imageUrl?: string;
    } | null;
    weekSlug?: string;
    lessonSlug?: string;
    likeCount: number;
    commentCount: number;
    isPinned: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string;
      email: string;
      companyName?: string;
      avatarUrl?: string | null;
      companyLogoUrl?: string | null;
    } | null;
    liked: boolean;
    isMine: boolean;
  };
  isAdmin?: boolean;
  onChanged?: () => void;
}

const SOCIAL_ICON: Record<string, { icon: any; label: string; color: string }> = {
  linkedin: { icon: PiLinkedinLogoFill, label: "LinkedIn", color: "text-[#0A66C2]" },
  twitter: { icon: PiTwitterLogoFill, label: "X", color: "text-slate-900" },
  instagram: { icon: PiInstagramLogoFill, label: "Instagram", color: "text-[#E1306C]" },
  youtube: { icon: PiYoutubeLogoFill, label: "YouTube", color: "text-[#FF0000]" },
  blog: { icon: PiLinkSimpleBold, label: "Link", color: "text-slate-500" },
};

export default function PostCard({ post, isAdmin, onChanged }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [count, setCount] = useState(post.likeCount);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const r = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const j = await r.json();
      setCount(j.likeCount);
      setLiked(j.liked);
    } catch {
      setLiked(!next);
      setCount(post.likeCount);
    }
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    setBusy(true);
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function pinPost() {
    setBusy(true);
    try {
      await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function hidePost() {
    setBusy(true);
    try {
      await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: true }),
      });
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  /** Pin (or unpin) this post on the OWNER's /u/[id] profile. Owner-only. */
  async function pinToMyProfile() {
    setBusy(true);
    try {
      const r = await fetch("/api/profile/me/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const j = await r.json();
      if (typeof j?.pinned === "boolean") {
        const verb = j.pinned ? "Pinned to" : "Unpinned from";
        if (typeof window !== "undefined") {
          // soft toast — replace with proper toast lib if needed
          console.log(`${verb} your profile`);
        }
      }
      onChanged?.();
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  }

  const socialMeta =
    post.attachment?.type && SOCIAL_ICON[post.attachment.type]
      ? SOCIAL_ICON[post.attachment.type]
      : SOCIAL_ICON.blog;

  const attType = post.attachment?.type;

  return (
    <article
      id={`post-${post.id}`}
      className={cn(
        "rounded-2xl border bg-white p-4 transition-all",
        post.isPinned ? "border-amber-200 bg-amber-50/40" : "border-slate-200 hover:shadow-sm"
      )}
    >
      {post.isPinned && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold text-amber-700">
          <Pin className="h-3 w-3" />
          Pinned by Zaptick
        </div>
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {post.author && (
            <Link href={`/u/${post.author.id}`}>
              <Avatar
                name={post.author.name}
                email={post.author.email}
                src={post.author.avatarUrl || undefined}
                overlayUrl={
                  post.author.avatarUrl
                    ? undefined
                    : post.author.companyLogoUrl || undefined
                }
                size={42}
              />
            </Link>
          )}
          <div className="min-w-0">
            {post.author ? (
              <Link
                href={`/u/${post.author.id}`}
                className="text-sm font-bold text-slate-900 hover:text-emerald-700 truncate block"
              >
                {post.author.name}
              </Link>
            ) : (
              <div className="text-sm font-bold text-slate-500">Member</div>
            )}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
              {post.author?.companyName && <span className="truncate">{post.author.companyName}</span>}
              {post.author?.companyName && <span>·</span>}
              <span>{fmtRelative(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {(post.isMine || isAdmin) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {isAdmin && (
                  <button
                    onClick={pinPost}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    {post.isPinned ? "Unpin from feed" : "Pin to feed"}
                  </button>
                )}
                {post.isMine && (
                  <button
                    onClick={pinToMyProfile}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    Pin to my profile
                  </button>
                )}
                {isAdmin && !post.isMine && (
                  <button
                    onClick={hidePost}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hide post
                  </button>
                )}
                {(post.isMine || isAdmin) && (
                  <button
                    onClick={deletePost}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="mt-3 whitespace-pre-wrap text-[15px] text-slate-800 leading-relaxed">
        {post.body}
      </div>

      {post.attachment?.url &&
        (attType === "image" ? (
          <a
            href={post.attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.attachment.imageUrl || post.attachment.url}
              alt=""
              className="max-h-[min(420px,70vh)] w-full object-contain bg-slate-900/[0.03]"
              referrerPolicy="no-referrer"
            />
          </a>
        ) : attType === "video" ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black">
            <video
              src={post.attachment.url}
              controls
              playsInline
              className="w-full max-h-[min(420px,70vh)]"
            />
          </div>
        ) : attType === "file" ? (
          <a
            href={post.attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-emerald-300 hover:bg-white transition-colors"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600">
              <FileText className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">File</span>
              <span className="block text-sm font-semibold text-slate-900 truncate">
                {post.attachment.title || "Download attachment"}
              </span>
              <span className="block text-[11px] text-slate-500 truncate">
                {(() => {
                  try {
                    return new URL(post.attachment.url).pathname.split("/").pop() || "Document";
                  } catch {
                    return "Document";
                  }
                })()}
              </span>
            </span>
            <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
          </a>
        ) : (
          <a
            href={post.attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-emerald-300 hover:bg-white transition-colors"
          >
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 ${socialMeta.color}`}>
              <socialMeta.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                {socialMeta.label}
              </span>
              <span className="block text-sm font-semibold text-slate-900 truncate">
                {post.attachment.title || post.attachment.url}
              </span>
              <span className="block text-[11px] text-slate-500 truncate">
                {(() => {
                  try {
                    return new URL(post.attachment.url).hostname.replace(/^www\./, "");
                  } catch {
                    return post.attachment.url;
                  }
                })()}
              </span>
            </span>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        ))}

      <footer className="mt-3 flex items-center gap-1 text-slate-500">
        <button
          type="button"
          onClick={toggleLike}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors",
            liked
              ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
              : "hover:bg-slate-100"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-rose-500 text-rose-500")} />
          <span>{shortNumber(count)}</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100"
          aria-label="Comments"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{shortNumber(post.commentCount)}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = `${window.location.origin}/community#post-${post.id}`;
            if (navigator.share) navigator.share({ url, title: post.body.slice(0, 60) }).catch(() => {});
            else navigator.clipboard?.writeText(url);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </footer>
    </article>
  );
}
