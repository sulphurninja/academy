"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle2,
  Heart,
  Loader2,
  Megaphone,
  MessageSquare,
  Sparkles,
  Trophy,
  UserPlus,
  Handshake,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { fmtRelative, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  kind: string;
  body: string;
  href?: string;
  meta?: Record<string, any>;
  readAt?: string;
  createdAt: string;
  actor?: { _id?: string; name: string; email: string } | null;
}

const KIND_ICON: Record<string, any> = {
  follow: UserPlus,
  post_like: Heart,
  post_comment: MessageSquare,
  comment_reply: MessageSquare,
  badge_earned: Trophy,
  level_up: Sparkles,
  announcement: Megaphone,
  lesson_published: Sparkles,
  reach_request: Handshake,
  reach_accepted: CheckCircle2,
};

const KIND_COLOR: Record<string, string> = {
  follow: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  post_like: "bg-rose-50 text-rose-600 ring-rose-200",
  badge_earned: "bg-amber-50 text-amber-700 ring-amber-200",
  level_up: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  announcement: "bg-violet-50 text-violet-700 ring-violet-200",
  reach_request: "bg-amber-50 text-amber-700 ring-amber-200",
  reach_accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

type Tab = "all" | "follows" | "reach" | "social" | "system";

export function NotificationsClient({ userId, userName }: { userId: string; userName: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications");
      const j = await r.json();
      setItems(j.notifications || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "POST" });
    setItems((prev) =>
      prev.map((p) => (p.readAt ? p : { ...p, readAt: new Date().toISOString() }))
    );
  }

  async function handleReachAction(notif: Notification, action: "accept" | "reject") {
    const requestId = notif.meta?.requestId;
    if (!requestId) return;
    setActionLoading(notif.id);
    try {
      await fetch("/api/reach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, requestId }),
      });
      setItems((prev) =>
        prev.map((n) =>
          n.id === notif.id
            ? {
                ...n,
                meta: { ...n.meta, responded: action },
                body:
                  action === "accept"
                    ? `You accepted ${notif.actor?.name || "someone"}'s connect request`
                    : `You declined ${notif.actor?.name || "someone"}'s connect request`,
              }
            : n
        )
      );
    } catch {}
    setActionLoading(null);
  }

  const filtered = items.filter((n) => {
    if (tab === "all") return true;
    if (tab === "follows") return n.kind === "follow";
    if (tab === "reach") return n.kind === "reach_request" || n.kind === "reach_accepted";
    if (tab === "social") return ["post_like", "post_comment", "comment_reply"].includes(n.kind);
    if (tab === "system") return ["badge_earned", "level_up", "announcement", "lesson_published"].includes(n.kind);
    return true;
  });

  const unread = items.filter((n) => !n.readAt).length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: items.length },
    { id: "follows", label: "Follows" },
    { id: "reach", label: "Connect" },
    { id: "social", label: "Social" },
    { id: "system", label: "System" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-soft">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors",
              tab === t.id
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-slate-300 mb-3" />
          <div className="text-sm font-bold text-slate-900">No notifications here</div>
          <p className="text-xs text-slate-500 mt-1">
            {tab === "all" ? "When something happens, you'll see it here." : "Nothing in this category yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
          {filtered.map((n) => {
            const Icon = KIND_ICON[n.kind] || Sparkles;
            const colorCls = KIND_COLOR[n.kind] || "bg-slate-50 text-slate-600 ring-slate-200";
            const isReachRequest = n.kind === "reach_request" && !n.meta?.responded;

            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-4 sm:px-5 transition-colors",
                  !n.readAt && "bg-emerald-50/20"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                    colorCls
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-slate-900 leading-snug">{n.body}</p>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {fmtRelative(n.createdAt)}
                      </div>
                    </div>
                    {!n.readAt && (
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>

                  {/* Reach request actions */}
                  {isReachRequest && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        disabled={actionLoading === n.id}
                        onClick={() => handleReachAction(n, "accept")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actionLoading === n.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Accept
                      </button>
                      <button
                        disabled={actionLoading === n.id}
                        onClick={() => handleReachAction(n, "reject")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" /> Decline
                      </button>
                    </div>
                  )}

                  {n.meta?.responded && (
                    <div className="mt-1 text-[11px] font-bold text-emerald-600">
                      {n.meta.responded === "accept" ? "Accepted" : "Declined"}
                    </div>
                  )}

                  {n.href && !isReachRequest && (
                    <Link
                      href={n.href}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
