"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Sparkles, Trophy, UserPlus, Heart, Megaphone } from "lucide-react";
import { fmtRelative } from "@/lib/utils";

interface Notification {
  id: string;
  kind: string;
  body: string;
  href?: string;
  readAt?: string;
  createdAt: string;
  actor?: { name: string; email: string } | null;
}

const KIND_ICON: Record<string, any> = {
  follow: UserPlus,
  post_like: Heart,
  post_comment: Sparkles,
  comment_reply: Sparkles,
  badge_earned: Trophy,
  level_up: Sparkles,
  announcement: Megaphone,
  lesson_published: Sparkles,
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch("/api/notifications");
      const j = await r.json();
      setItems(j.notifications || []);
      setUnread(j.unreadCount || 0);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "POST" });
    setUnread(0);
    setItems((prev) =>
      prev.map((p) => (p.readAt ? p : { ...p, readAt: new Date().toISOString() }))
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/40 transition"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-[360px] max-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-sm font-extrabold text-slate-900 hover:text-emerald-700">
              Notifications
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            </div>
          </div>
          <div className="max-h-[440px] overflow-y-auto scrollbar-soft">
            {items.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500">
                <Bell className="mx-auto h-6 w-6 mb-2 text-slate-300" />
                <div className="text-sm">All caught up.</div>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const Icon = KIND_ICON[n.kind] || Sparkles;
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.href || "#"}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 ${
                          !n.readAt ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-slate-900 leading-snug">{n.body}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {fmtRelative(n.createdAt)}
                          </div>
                        </div>
                        {!n.readAt && (
                          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="border-t border-slate-100 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
