"use client";

import { useEffect, useState } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserCard from "@/components/academy/UserCard";
import type { AcademyMember } from "@/lib/profile";
import { fmtNumber } from "@/lib/utils";

export default function MembersClient({
  initialMembers,
  initialTotal,
  initialQuery,
}: {
  initialMembers: AcademyMember[];
  initialTotal: number;
  initialQuery: string;
}) {
  const [q, setQ] = useState(initialQuery || "");
  const [members, setMembers] = useState<AcademyMember[]>(initialMembers);
  const [total, setTotal] = useState(initialTotal);
  const [skip, setSkip] = useState(initialMembers.length);
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState<"card" | "row">("card");

  // Debounced search
  useEffect(() => {
    const debounced = setTimeout(async () => {
      if (q === initialQuery) return;
      setLoading(true);
      try {
        const r = await fetch(`/api/users/search?q=${encodeURIComponent(q)}&limit=24`);
        const j = await r.json();
        setMembers(j.members || []);
        setTotal(j.total || 0);
        setSkip((j.members || []).length);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounced);
  }, [q, initialQuery]);

  async function loadMore() {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/users/search?q=${encodeURIComponent(q)}&limit=24&skip=${skip}`
      );
      const j = await r.json();
      setMembers((prev) => [...prev, ...(j.members || [])]);
      setSkip((s) => s + (j.members || []).length);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
          <Users className="h-3 w-3" />
          Member directory
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Browse all Zaptick members
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Founders, marketers, agency owners, ecom operators — your future
          collaborators are right here. Search, follow, and message them.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or company…"
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {fmtNumber(total)} members
          </span>
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setLayout("card")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                layout === "card"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setLayout("row")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                layout === "row"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Users className="mx-auto h-7 w-7 text-slate-400" />
          <div className="mt-2 text-sm font-bold text-slate-900">No members found</div>
          <div className="text-xs text-slate-500 mt-1">Try a different search.</div>
        </div>
      ) : layout === "card" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {members.map((m) => (
            <UserCard key={m.id} member={m} layout="card" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <UserCard key={m.id} member={m} layout="row" />
          ))}
        </div>
      )}

      {members.length < total && (
        <div className="flex justify-center pt-2">
          <Button onClick={loadMore} disabled={loading} variant="outline" className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
