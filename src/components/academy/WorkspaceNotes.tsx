"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  CheckCircle2,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteItem {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  createdAt: string;
}

export default function WorkspaceNotes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        if (!selected && data.length > 0) setSelected(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const activeNote = notes.find((n) => n.id === selected);

  const createNote = async () => {
    try {
      const res = await fetch("/api/workspace/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", body: "" }),
      });
      if (res.ok) {
        const { id } = await res.json();
        setSelected(id);
        fetchNotes();
      }
    } catch {}
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selected === id) setSelected(notes.find((n) => n.id !== id)?.id || null);
    await fetch("/api/workspace/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const saveNote = useCallback(async (id: string, field: "title" | "body", value: string) => {
    setSaved(false);
    setSaving(true);
    try {
      await fetch("/api/workspace/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, []);

  const debounceSave = useCallback((id: string, field: "title" | "body", value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNote(id, field, value), 800);
  }, [saveNote]);

  const updateLocal = (id: string, field: "title" | "body", value: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
    debounceSave(id, field, value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 space-y-2">
        <button
          onClick={createNote}
          className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New Note
        </button>

        <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-soft">
          {notes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
              <StickyNote className="h-6 w-6 text-slate-300 mx-auto mb-1" />
              <p className="text-xs text-slate-500">No notes yet</p>
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setSelected(note.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-2.5 transition-all group",
                  selected === note.id
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      "text-xs font-bold truncate",
                      selected === note.id ? "text-emerald-700" : "text-slate-900"
                    )}>
                      {note.title || "Untitled"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {note.body && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{note.body}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
        {activeNote ? (
          <>
            <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-2">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateLocal(activeNote.id, "title", e.target.value)}
                className="flex-1 text-sm font-bold text-slate-900 bg-transparent focus:outline-none"
                placeholder="Note title"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                {saving && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                {saved && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={activeNote.body}
              onChange={(e) => updateLocal(activeNote.id, "body", e.target.value)}
              placeholder="Start writing your ideas, campaign plans, meeting notes..."
              className="flex-1 p-4 text-sm text-slate-700 leading-relaxed resize-none focus:outline-none placeholder:text-slate-300"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">No note selected</p>
              <p className="text-xs text-slate-500 mt-1">Create or select a note to start writing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
