"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";
import PostCard from "@/components/academy/PostCard";
import { Button } from "@/components/ui/button";

export default function ProfilePosts({
  userId,
  viewerIsAdmin,
}: {
  userId: string;
  viewerIsAdmin: boolean;
}) {
  const [posts, setPosts] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (reset?: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ userId });
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
    [cursor, posts, userId]
  );

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading && posts.length === 0) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <Sparkles className="mx-auto h-7 w-7 text-emerald-500" />
        <div className="mt-2 text-sm font-bold text-slate-900">No posts yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} isAdmin={viewerIsAdmin} onChanged={() => load(true)} />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => load(false)} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
