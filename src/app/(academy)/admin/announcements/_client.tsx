"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export default function AnnouncementsClient() {
  const [body, setBody] = useState("");
  const [href, setHref] = useState("");
  const [audience, setAudience] = useState<"all" | "growth" | "growth_plus">("all");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!body.trim()) {
      setError("Message body is required.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const r = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, href: href || undefined, audience }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error || "Send failed");
      } else {
        setResult({ count: j.fannedOutTo });
        setBody("");
        setHref("");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 max-w-2xl">
      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
        Message
      </label>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="📢 New lesson dropped: Workflow builder · Mon 9 PM IST live AMA"
      />
      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-4 mb-1">
        Link (optional)
      </label>
      <Input
        value={href}
        onChange={(e) => setHref(e.target.value)}
        placeholder="/curriculum/wk1-conversations/inbox-tour"
      />
      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-4 mb-1">
        Audience
      </label>
      <select
        value={audience}
        onChange={(e) => setAudience(e.target.value as any)}
        className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="all">Everyone (all active users)</option>
        <option value="growth">Growth plan only</option>
        <option value="growth_plus">Growth+ plan only</option>
      </select>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Sent to {result.count} members.
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button onClick={send} disabled={pending} className="gap-2">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Fan out announcement
        </Button>
      </div>
    </div>
  );
}
