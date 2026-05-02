"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Sparkles, Users, Globe2, Heart } from "lucide-react";
import PostComposer from "@/components/academy/PostComposer";
import PostCard from "@/components/academy/PostCard";
import SuggestedMembers from "@/components/academy/SuggestedMembers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Scope = "feed" | "following" | "me";

interface Props {
  isAdmin: boolean;
  me: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    companyLogoUrl?: string | null;
  };
}

export default function CommunityClient({ isAdmin, me }: Props) {
  const [scope, setScope] = useState<Scope>("feed");
  const [posts, setPosts] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (reset?: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ scope });
        if (!reset && cursor) params.set("cursor", cursor);
        const r = await fetch(`/api/posts?${params.toString()}`);
        const j = await r.json();
        const next = j.posts || [];
        setPosts(reset ? next : [...posts, ...next]);
        setCursor(j.nextCursor);
        setHasMore(!!j.nextCursor);
      } finally {
        setLoading(false);
      }
    },
    [scope, cursor, posts]
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const refresh = () => load(true);

  const tabs: { id: Scope; label: string; icon: any }[] = [
    { id: "feed", label: "Everyone", icon: Globe2 },
    { id: "following", label: "Following", icon: Users },
    { id: "me", label: "My posts", icon: Heart },
  ];

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <div className="space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              <Sparkles className="h-3 w-3" />
              Cohort community
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              The feed
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-xl">
              Wins, questions, frameworks, lessons learned. The good stuff. Earn
              XP for posting and engaging.
            </p>
          </div>
        </header>

        <PostComposer me={me} onPosted={refresh} />

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setScope(t.id)}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                scope === t.id
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-500 hover:text-slate-900 border border-transparent"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {posts.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-emerald-500" />
            <div className="mt-2 text-sm font-bold text-slate-900">
              {scope === "feed" ? "Be the first to post!" : scope === "following" ? "Follow members to see their posts here." : "You haven't posted yet."}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} isAdmin={isAdmin} onChanged={refresh} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => load(false)}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="hidden lg:block space-y-4">
        <SuggestedMembers limit={5} variant="sidebar" />
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2">Community guidelines</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>· Be helpful. Share what worked. Be specific.</li>
            <li>· No spam, no DMs to outside SaaS, no recruiting.</li>
            <li>· Cite founder names + clients only with permission.</li>
            <li>· Wins &gt; opinions. Show receipts.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
