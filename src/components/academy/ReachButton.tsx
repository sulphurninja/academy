"use client";

import { useState, useEffect, useCallback } from "react";
import { Handshake, Loader2, CheckCircle2, Mail, Phone, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
}

interface ReachState {
  sentStatus: string | null;
  receivedStatus: string | null;
  mutual: boolean;
  contactInfo: { email?: string; whatsapp?: string | null } | null;
}

export default function ReachButton({ userId }: Props) {
  const [state, setState] = useState<ReachState | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/reach?userId=${userId}`);
      const j = await r.json();
      setState(j);
    } catch {}
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendRequest() {
    setSending(true);
    try {
      await fetch("/api/reach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", userId }),
      });
      setState((s) => s ? { ...s, sentStatus: "pending" } : s);
    } catch {}
    setSending(false);
  }

  function copyText(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return null;
  if (!state) return null;

  if (state.mutual && state.contactInfo) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowContact((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 h-10 text-xs font-bold text-emerald-700"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </button>
        {showContact && (
          <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-slate-200 bg-white shadow-xl p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Contact info
            </div>
            {state.contactInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 flex-1 truncate">{state.contactInfo.email}</span>
                <button onClick={() => copyText(state.contactInfo!.email!, "email")} className="shrink-0 text-slate-400 hover:text-slate-700">
                  {copied === "email" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
            {state.contactInfo.whatsapp && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 flex-1 truncate">{state.contactInfo.whatsapp}</span>
                <button onClick={() => copyText(state.contactInfo!.whatsapp!, "phone")} className="shrink-0 text-slate-400 hover:text-slate-700">
                  {copied === "phone" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
            {!state.contactInfo.whatsapp && (
              <div className="text-xs text-slate-500">No WhatsApp number on file</div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (state.sentStatus === "pending") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 h-10 text-xs font-bold text-amber-700 cursor-default"
      >
        <Handshake className="h-3.5 w-3.5" />
        Request sent
      </button>
    );
  }

  if (state.receivedStatus === "pending") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 h-10 text-xs font-bold text-cyan-700 cursor-default"
      >
        <Handshake className="h-3.5 w-3.5" />
        Respond in notifications
      </button>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={sending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 px-3 h-10 text-xs font-bold text-slate-700 disabled:opacity-50"
    >
      {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Handshake className="h-3.5 w-3.5" />}
      Connect
    </button>
  );
}
