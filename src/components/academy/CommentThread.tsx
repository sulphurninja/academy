"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { fmtRelative } from "@/lib/utils";

interface ApiComment {
  _id: string;
  body: string;
  authorId?: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  likes: number;
  liked: boolean;
}

interface CommentThreadProps {
  weekSlug: string;
  lessonSlug: string;
  currentUserId?: string;
}

export default function CommentThread({ weekSlug, lessonSlug }: CommentThreadProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/comments?weekSlug=${encodeURIComponent(weekSlug)}&lessonSlug=${encodeURIComponent(lessonSlug)}`
      );
      const j = await r.json();
      setComments(j.comments || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [weekSlug, lessonSlug]);

  async function submit() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, lessonSlug, body: draft.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Failed to post comment. Please try again.");
        return;
      }
      setDraft("");
      await load();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Drop a question, share what worked, or shout out a teammate…"
          rows={3}
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">+10 XP per comment · Be helpful, stay kind.</p>
          <Button onClick={submit} disabled={posting || !draft.trim()} size="sm" className="gap-2">
            {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Post
        </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
          <MessageCircle className="mx-auto h-7 w-7 text-slate-400" />
          <div className="mt-2 text-sm text-slate-700 font-medium">
            No comments yet. Kick off the conversation.
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c._id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={c.authorName}
                  email={c.authorEmail}
                  src={c.authorAvatarUrl || undefined}
                  size={36}
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">{c.authorName}</div>
                  <div className="text-[11px] text-slate-500">{fmtRelative(c.createdAt)}</div>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
