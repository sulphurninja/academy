"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import FollowButton from "@/components/academy/FollowButton";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
  isMe: boolean;
}

type Tab = "followers" | "following";

interface Props {
  userId: string;
  userName: string;
  viewerId: string;
  initialTab: Tab;
}

export function ConnectionsClient({ userId, userName, viewerId, initialTab }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/follow/list?userId=${userId}&type=${tab}&limit=100`);
      const j = await r.json();
      setMembers(j.members || []);
      setTotal(j.total || 0);
    } catch {}
    setLoading(false);
  }, [userId, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const isMe = userId === viewerId;

  return (
    <div className="space-y-6">
      <Link
        href={`/u/${userId}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {isMe ? "your" : `${userName}'s`} profile
      </Link>

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isMe ? "Your" : `${userName}'s`} connections
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {(["followers", "following"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors",
              tab === t
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            )}
          >
            {t === "followers" ? "Followers" : "Following"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-slate-300 mb-3" />
          <div className="text-sm font-bold text-slate-900">
            {tab === "followers" ? "No followers yet" : "Not following anyone yet"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {tab === "followers"
              ? "When someone follows, they'll appear here."
              : "Follow members to see them here."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          <div className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-slate-400">
            {total} {tab}
          </div>
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors"
            >
              <Link href={`/u/${m.id}`} className="shrink-0">
                <Avatar
                  name={m.name}
                  email={m.email}
                  src={m.avatarUrl || undefined}
                  size={40}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/u/${m.id}`} className="text-sm font-bold text-slate-900 hover:text-emerald-700 truncate block">
                  {m.name}
                </Link>
                {m.companyName && (
                  <div className="text-xs text-slate-500 truncate">{m.companyName}</div>
                )}
              </div>
              {!m.isMe && (
                <FollowButton userId={m.id} initialIsFollowing={m.isFollowing} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
