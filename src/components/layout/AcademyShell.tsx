"use client";

import { useEffect, useState } from "react";
import AcademySidebar from "./AcademySidebar";
import AcademyTopbar from "./AcademyTopbar";
import SpotifyPlayer from "@/components/academy/SpotifyPlayer";
import { type LevelInfo } from "@/lib/xp";

interface ShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    avatarUrl?: string | null;
    companyLogoUrl?: string | null;
    companyName?: string | null;
  };
  xp: number;
  level: LevelInfo;
  streak: number;
  children: React.ReactNode;
}

const STORAGE_KEY = "zapacademy:sidebar-collapsed";

export default function AcademyShell({
  user,
  xp,
  level,
  streak,
  children,
}: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Hydrate from localStorage on mount (server-rendered HTML defaults to expanded)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setCollapsed(true);
    } catch {}
  }, []);

  function handleToggle(next: boolean) {
    setCollapsed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <AcademySidebar
        user={user}
        xp={xp}
        level={level}
        streak={streak}
        isCollapsed={collapsed}
        onCollapsedChange={handleToggle}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <AcademyTopbar
          user={user}
          xp={xp}
          level={level}
          streak={streak}
        />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
      <SpotifyPlayer />
    </div>
  );
}
