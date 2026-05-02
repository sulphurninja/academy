"use client";

import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "zapacademy:spotify-uri";
const COLLAPSED_KEY = "zapacademy:spotify-collapsed";

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const PRESETS = [
  { label: "Lo-Fi Focus", uri: "spotify:playlist:0vvXsWCC9xrXsKd4FyS8kM" },
  { label: "Deep Focus", uri: "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ" },
  { label: "Peaceful Piano", uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO" },
  { label: "Chill Beats", uri: "spotify:playlist:37i9dQZF1DX36edUJpD76c" },
  { label: "Brain Food", uri: "spotify:playlist:37i9dQZF1DWXe9gFZP0gtP" },
  { label: "Coding Mode", uri: "spotify:playlist:37i9dQZF1DX5trt9i14X7j" },
];

function uriToEmbedUrl(uri: string): string {
  if (uri.startsWith("spotify:")) {
    const parts = uri.replace("spotify:", "").split(":");
    if (parts.length >= 2) {
      return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator&theme=0`;
    }
  }
  if (uri.startsWith("https://open.spotify.com/")) {
    try {
      const url = new URL(uri);
      return `https://open.spotify.com/embed${url.pathname}?utm_source=generator&theme=0`;
    } catch {}
  }
  return uri;
}

function getPresetName(uri: string): string | null {
  const p = PRESETS.find((pr) => pr.uri === uri);
  return p ? p.label : null;
}

export function SpotifyTopbarPill({ onClick }: { onClick: () => void }) {
  const [uri, setUri] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUri(saved);
    } catch {}
    const handler = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setUri(saved || "");
      } catch {}
    };
    window.addEventListener("storage", handler);
    window.addEventListener("spotify-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("spotify-changed", handler);
    };
  }, []);

  if (!uri) return null;

  const name = getPresetName(uri);

  return (
    <button
      onClick={onClick}
      className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 px-3 py-1.5 hover:bg-[#1DB954]/20 transition-colors"
      title="Now playing on Spotify"
    >
      <SpotifyIcon className="h-3.5 w-3.5 text-[#1DB954]" />
      <span className="text-[10px] font-bold text-[#1DB954] max-w-[80px] truncate">
        {name || "Playing"}
      </span>
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-[#1DB954] animate-ping opacity-50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1DB954]" />
      </span>
    </button>
  );
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

  const notifyChange = () => {
    window.dispatchEvent(new Event("spotify-changed"));
  };

  const selectPreset = (presetUri: string) => {
    setUri(presetUri);
    setOpen(true);
    try { localStorage.setItem(STORAGE_KEY, presetUri); } catch {}
    notifyChange();
  };

  const connectCustom = () => {
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    setUri(clean);
    setOpen(true);
    setCustomInput("");
    try { localStorage.setItem(STORAGE_KEY, clean); } catch {}
    notifyChange();
  };

  const close = () => {
    setOpen(false);
    setUri("");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    notifyChange();
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
          <SpotifyIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-40 rounded-2xl bg-[#121212] border border-[#282828] shadow-2xl transition-all overflow-hidden",
      collapsed ? "w-[280px]" : "w-[320px]"
    )}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#282828]">
        <div className="flex items-center gap-2">
          <SpotifyIcon className="h-5 w-5 text-[#1DB954]" />
          <span className="text-xs font-bold text-white">Spotify</span>
          {uri && (
            <span className="text-[9px] text-[#1DB954] font-bold truncate max-w-[100px]">
              {getPresetName(uri) || "Custom"}
            </span>
          )}
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
              <SpotifyIcon className="h-8 w-8 text-[#1DB954] mx-auto mb-2" />
              <p className="text-xs text-[#b3b3b3]">Pick a playlist or paste any Spotify link</p>
              <p className="text-[10px] text-[#666] mt-1">Albums, playlists, podcasts, tracks — anything</p>
            </div>
          )}

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

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") connectCustom(); }}
              placeholder="Paste any Spotify link…"
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
