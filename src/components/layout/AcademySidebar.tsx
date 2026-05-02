"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
  Flame,
  Users,
  Sparkles,
  ChevronRight,
  Bookmark,
  MessageSquare,
  Settings,
  Crown,
  ChevronLeft,
  Search,
  PlayCircle,
  ShieldCheck,
  CalendarDays,
  Compass,
  Map,
  GraduationCap,
  X,
  Bell,
  Code2,
  FileText,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, fmtNumber } from "@/lib/utils";
import { type LevelInfo } from "@/lib/xp";

interface AcademySidebarProps {
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
  isCollapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function AcademySidebar({
  user,
  xp,
  level,
  streak,
  isCollapsed = false,
  onCollapsedChange,
}: AcademySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const NAV: { id: string; title: string; items: NavItem[] }[] = useMemo(
    () => [
      {
        id: "main",
        title: "Workspace",
        items: [
          { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
          {
            title: "Community",
            href: "/community",
            icon: <MessageSquare className="h-4 w-4" />,
            badge: "live",
          },
          { title: "Members", href: "/members", icon: <Users className="h-4 w-4" /> },
        ],
      },
      {
        id: "learn",
        title: "Learn",
        items: [
          {
            title: "Curriculum",
            href: "/curriculum",
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            title: "Written Guides",
            href: "/guides",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            title: "Today's lesson",
            href: "/curriculum/wk0-onboarding",
            icon: <PlayCircle className="h-4 w-4" />,
          },
          {
            title: "Bookmarks",
            href: "/bookmarks",
            icon: <Bookmark className="h-4 w-4" />,
          },
          {
            title: "Certification",
            href: "/certification",
            icon: <GraduationCap className="h-4 w-4" />,
          },
          {
            title: "Live calls",
            href: "/calendar",
            icon: <CalendarDays className="h-4 w-4" />,
            badge: "soon",
          },
        ],
      },
      {
        id: "play",
        title: "Compete",
        items: [
          { title: "Level arenas", href: "/levels", icon: <Map className="h-4 w-4" /> },
          { title: "Leaderboard", href: "/leaderboard", icon: <Trophy className="h-4 w-4" /> },
          { title: "Badges", href: "/badges", icon: <Award className="h-4 w-4" /> },
          { title: "Streaks", href: "/streaks", icon: <Flame className="h-4 w-4" /> },
          {
            title: "Showdown",
            href: process.env.NEXT_PUBLIC_ZAPTICK_URL
              ? `${process.env.NEXT_PUBLIC_ZAPTICK_URL}/zapacademy/showdown`
              : "/showdown",
            icon: <Crown className="h-4 w-4" />,
            badge: "₹1L",
          },
        ],
      },
      {
        id: "you",
        title: "You",
        items: [
          { title: "Profile", href: `/u/${user.id}`, icon: <Compass className="h-4 w-4" /> },
          { title: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" /> },
          { title: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
        ],
      },
      {
        id: "more",
        title: "More",
        items: [
          {
            title: "Developer Platform",
            href: "/developers",
            icon: <Code2 className="h-4 w-4" />,
          },
        ],
      },
    ],
    [user.id]
  );

  const allNavItems = useMemo(
    () => NAV.flatMap((s) => s.items.map((item) => ({ ...item, section: s.title }))),
    [NAV]
  );

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allNavItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    );
  }, [search, allNavItems]);

  const showDropdown = searchFocused && search.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminItems: NavItem[] = [
    { title: "Lessons", href: "/admin/lessons", icon: <BookOpen className="h-4 w-4" /> },
    { title: "Announcements", href: "/admin/announcements", icon: <Sparkles className="h-4 w-4" /> },
    { title: "Community", href: "/admin/community", icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-slate-200 bg-white sticky top-0",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo + collapse */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-slate-100",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 min-w-0",
            isCollapsed && "justify-center"
          )}
          aria-label="ZapAcademy by Zaptick"
        >
          {isCollapsed ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm shrink-0 ring-1 ring-emerald-100">
              <Image
                src="/tick.png"
                alt="Zaptick"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
                priority
              />
            </span>
          ) : (
            <>
              <Image
                src="/zapzap.png"
                alt="Zaptick"
                width={108}
                height={32}
                priority
                className="h-7 w-auto object-contain"
              />
              <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
                Academy
              </span>
            </>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => onCollapsedChange?.(!isCollapsed)}
            className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => onCollapsedChange?.(!isCollapsed)}
          className="hidden lg:flex items-center justify-center h-7 mx-2 mt-2 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 pt-3 relative">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  if (searchResults.length > 0) {
                    router.push(searchResults[0].href);
                  } else {
                    router.push(`/members?q=${encodeURIComponent(search.trim())}`);
                  }
                  setSearch("");
                  setSearchFocused(false);
                }
                if (e.key === "Escape") {
                  setSearch("");
                  setSearchFocused(false);
                  searchRef.current?.blur();
                }
              }}
              placeholder="Search pages & members…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute left-3 right-3 top-[calc(100%+4px)] z-30 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
            >
              {searchResults.length > 0 ? (
                <ul className="py-1 max-h-64 overflow-y-auto scrollbar-soft">
                  {searchResults.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { setSearch(""); setSearchFocused(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-emerald-50 transition-colors"
                      >
                        <span className="text-slate-500 shrink-0">{item.icon}</span>
                        <span className="font-semibold text-slate-900 flex-1 truncate">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">{item.section}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3">
                  <div className="text-xs text-slate-500 mb-2">No pages matched. Search members instead?</div>
                  <button
                    onClick={() => {
                      router.push(`/members?q=${encodeURIComponent(search.trim())}`);
                      setSearch("");
                      setSearchFocused(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 transition-colors"
                  >
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold text-slate-900">Search members for &ldquo;{search}&rdquo;</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* XP / streak summary card */}
      {!isCollapsed && (
        <div className="px-3 mt-3">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                name={user.name}
                email={user.email}
                src={user.avatarUrl || undefined}
                overlayUrl={user.avatarUrl ? undefined : user.companyLogoUrl || undefined}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  L{level.level} · {level.title}
                </div>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white border border-slate-200 px-2.5 py-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">XP</div>
                <div className="text-sm font-extrabold text-amber-600">{fmtNumber(xp)}</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-2.5 py-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Streak</div>
                <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-500 flame-breath" />
                  {streak}d
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="mt-3 flex-1 overflow-y-auto scrollbar-soft px-2 pb-3">
        {NAV.map((section) => (
          <div key={section.id} className="mb-3">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                        isCollapsed && "justify-center px-0",
                        active
                          ? "bg-emerald-50 text-emerald-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className={active ? "text-emerald-700" : "text-slate-500"}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="flex-1 truncate">{item.title}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {user.isAdmin && (
          <div className="mb-3">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] uppercase tracking-widest font-bold text-rose-500">
                Admin
              </div>
            )}
            <ul className="space-y-0.5">
              {adminItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                        isCollapsed && "justify-center px-0",
                        active
                          ? "bg-rose-50 text-rose-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className={active ? "text-rose-700" : "text-slate-500"}>{item.icon}</span>
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Footer / Zaptick brand link */}
      <div className="border-t border-slate-100 p-3">
        <a
          href={process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io"}
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? "Open Zaptick" : undefined}
          aria-label={isCollapsed ? "Open Zaptick" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-xl px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition",
            isCollapsed && "justify-center"
          )}
        >
          {isCollapsed ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-emerald-100">
              <Image
                src="/tick.png"
                alt="Zaptick"
                width={28}
                height={28}
                className="h-6 w-6 object-contain"
              />
            </span>
          ) : (
            <>
              <Image
                src="/zapzap.png"
                alt="Zaptick"
                width={64}
                height={18}
                className="h-4 w-auto object-contain opacity-80"
              />
              <span className="font-bold">
                Open Zaptick <span className="text-slate-400">→</span>
              </span>
            </>
          )}
        </a>
      </div>
    </aside>
  );
}
