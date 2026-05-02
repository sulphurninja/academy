"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  GripVertical,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentCardItem {
  id: string;
  title: string;
  description: string;
  channel: string | null;
  dueDate: string | null;
  column: string;
  position: number;
}

const COLUMNS = [
  { id: "ideas", label: "Ideas", color: "border-t-violet-500 bg-violet-50/30" },
  { id: "drafts", label: "Drafts", color: "border-t-blue-500 bg-blue-50/30" },
  { id: "review", label: "Review", color: "border-t-amber-500 bg-amber-50/30" },
  { id: "scheduled", label: "Scheduled", color: "border-t-emerald-500 bg-emerald-50/30" },
  { id: "published", label: "Published", color: "border-t-slate-500 bg-slate-50/30" },
] as const;

const CHANNEL_TAGS: Record<string, { label: string; color: string }> = {
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-700" },
  email: { label: "Email", color: "bg-blue-100 text-blue-700" },
  rcs: { label: "RCS", color: "bg-purple-100 text-purple-700" },
  instagram: { label: "Instagram", color: "bg-pink-100 text-pink-700" },
  voice: { label: "Voice", color: "bg-amber-100 text-amber-700" },
  blog: { label: "Blog", color: "bg-cyan-100 text-cyan-700" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700" },
};

export default function ContentBoard() {
  const [cards, setCards] = useState<ContentCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragCard, setDragCard] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/content");
      if (res.ok) setCards(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const addCard = async (column: string) => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, channel: newChannel || undefined, column }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewChannel("");
        setAddingTo(null);
        fetchCards();
      }
    } finally {
      setSaving(false);
    }
  };

  const moveCard = async (cardId: string, toColumn: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column: toColumn } : c))
    );
    await fetch("/api/workspace/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId, column: toColumn }),
    });
  };

  const deleteCard = async (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    await fetch("/api/workspace/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId }),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-soft">
      {COLUMNS.map((col) => {
        const colCards = cards.filter((c) => c.column === col.id);
        return (
          <div
            key={col.id}
            className={cn(
              "min-w-[240px] w-[240px] shrink-0 rounded-2xl border border-slate-200 border-t-4 overflow-hidden",
              col.color
            )}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-emerald-400"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-emerald-400"); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("ring-2", "ring-emerald-400");
              if (dragCard) moveCard(dragCard, col.id);
              setDragCard(null);
            }}
          >
            <div className="px-3 py-2.5 flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                {col.label}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 bg-white rounded-full h-5 w-5 flex items-center justify-center border border-slate-200">
                {colCards.length}
              </span>
            </div>

            <div className="px-2 pb-2 space-y-2 min-h-[100px]">
              {colCards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDragCard(card.id)}
                  onDragEnd={() => setDragCard(null)}
                  className={cn(
                    "rounded-xl bg-white border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all group",
                    dragCard === card.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{card.title}</div>
                      {card.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{card.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {card.channel && CHANNEL_TAGS[card.channel] && (
                      <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold", CHANNEL_TAGS[card.channel].color)}>
                        {CHANNEL_TAGS[card.channel].label}
                      </span>
                    )}
                    {card.dueDate && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(card.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>

                  {/* Quick column move */}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => moveCard(card.id, c.id)}
                        className="text-[8px] font-bold text-slate-400 hover:text-emerald-600 px-1 py-0.5 rounded hover:bg-emerald-50 transition-colors"
                      >
                        → {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {addingTo === col.id ? (
                <div className="rounded-xl bg-white border border-emerald-200 p-3 space-y-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Content title"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-emerald-400 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") addCard(col.id); if (e.key === "Escape") setAddingTo(null); }}
                  />
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="">No channel</option>
                    {Object.entries(CHANNEL_TAGS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addCard(col.id)}
                      disabled={saving || !newTitle.trim()}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {saving ? "Adding…" : "Add"}
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setNewTitle(""); setNewChannel(""); }}
                      className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTo(col.id)}
                  className="w-full rounded-xl border border-dashed border-slate-200 py-2 text-xs font-bold text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add card
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
