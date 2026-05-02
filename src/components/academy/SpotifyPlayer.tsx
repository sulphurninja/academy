"use client";

import { useState, useEffect } from "react";
import { Music, X, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "zapacademy:spotify-uri";
const COLLAPSED_KEY = "zapacademy:spotify-collapsed";

const PRESETS = [
  { label: "Lo-Fi Focus", uri: "spotify:playlist:0vvXsWCC9xrXsKd4FyS8kM" },
  { label: "Deep Focus", uri: "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ" },
  { label: "Peaceful Piano", uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO" },
  { label: "Chill Beats", uri: "spotify:playlist:37i9dQZF1DX36edUJpD76c" },
  { label: "Brain Food", uri: "spotify:playlist:37i9dQZF1DWXe9gFZP0gtP" },
  { label: "Coding Mode", uri: "spotify:playlist:37i9dQZF1DX5trt9i14X7j" },
];

function uriToEmbedUrl(uri: string): string {
  const parts = uri.replace("spotify:", "").split(":");
  if (parts.length >= 2) {
    return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator&theme=0`;
  }
  if (uri.startsWith("https://open.spotify.com/")) {
    const url = new URL(uri);
    return `https://open.spotify.com/embed${url.pathname}?utm_source=generator&theme=0`;
  }
  return uri;
}

export default function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [uri, setUri] = useState("");
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setUri(saved); setOpen(true); }
      const col = localStorage.getItem(COLLAPSED_KEY);
      if (col === "1") setCollapsed(true);
    } catch {}
  }, []);

  const selectPreset = (presetUri: string) => {
    setUri(presetUri);
    setOpen(true);
    try { localStorage.setItem(STORAGE_KEY, presetUri); } catch {}
  };

  const connectCustom = () => {
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    setUri(clean);
    setOpen(true);
    setCustomInput("");
    try { localStorage.setItem(STORAGE_KEY, clean); } catch {}
  };

  const close = () => {
    setOpen(false);
    setUri("");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    try { localStorage.setItem(COLLAPSED_KEY, !collapsed ? "1" : "0"); } catch {}
  };

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setOpen(true)}
          className="group h-12 w-12 rounded-full bg-[#1DB954] text-white shadow-lg shadow-[#1DB954]/30 hover:shadow-[#1DB954]/50 hover:scale-105 flex items-center justify-center transition-all"
          title="Open Spotify"
        >
          <Music className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-40 rounded-2xl bg-[#121212] border border-[#282828] shadow-2xl transition-all overflow-hidden",
      collapsed ? "w-[280px]" : "w-[320px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#282828]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold text-white">Study Music</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleCollapse} className="h-6 w-6 rounded-lg flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors">
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button onClick={close} className="h-6 w-6 rounded-lg flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-3">
          {/* Player */}
          {uri ? (
            <div className="rounded-xl overflow-hidden">
              <iframe
                src={uriToEmbedUrl(uri)}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-[#b3b3b3]">Pick a playlist or paste a Spotify link</p>
            </div>
          )}

          {/* Presets */}
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.uri}
                onClick={() => selectPreset(p.uri)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors text-left",
                  uri === p.uri
                    ? "bg-[#1DB954] text-white"
                    : "bg-[#282828] text-[#b3b3b3] hover:bg-[#333] hover:text-white"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom link */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") connectCustom(); }}
              placeholder="Paste Spotify link or URI…"
              className="flex-1 rounded-lg bg-[#282828] border border-[#333] px-2.5 py-1.5 text-[10px] text-white placeholder:text-[#666] focus:border-[#1DB954] focus:outline-none"
            />
            <button
              onClick={connectCustom}
              disabled={!customInput.trim()}
              className="rounded-lg bg-[#1DB954] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#1ed760] disabled:opacity-40 transition-colors"
            >
              Play
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
