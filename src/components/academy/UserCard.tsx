"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import FollowButton from "./FollowButton";
import { fmtNumber, cn } from "@/lib/utils";
import type { AcademyMember } from "@/lib/profile";

interface UserCardProps {
  member: AcademyMember;
  layout?: "row" | "card";
  /** Tighter row for narrow sidebars (smaller avatar, one-line meta). */
  compact?: boolean;
}

export default function UserCard({ member, layout = "card", compact }: UserCardProps) {
  if (layout === "row") {
    const avatarSize = compact ? 36 : 40;
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50/80 transition-all",
          compact ? "px-2.5 py-2" : "px-3 py-2.5"
        )}
      >
        <Link href={`/u/${member.id}`} className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar
            name={member.name}
            email={member.email}
            src={member.avatarUrl || undefined}
            overlayUrl={member.avatarUrl ? undefined : member.companyLogoUrl || undefined}
            size={avatarSize}
          />
          <div className="min-w-0">
            <div className={cn("font-bold text-slate-900 truncate", compact ? "text-[13px]" : "text-sm")}>
              {member.name}
            </div>
            {member.suggestionReason ? (
              <div className="text-[10px] text-emerald-700/90 truncate mt-0.5">{member.suggestionReason}</div>
            ) : (
              <div className="text-[11px] text-slate-500 truncate">
                {member.companyName || "Independent"}
                {!compact && (
                  <>
                    {" "}
                    · L{member.level.level} · {fmtNumber(member.xp)} XP
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
        {!member.isMe && (
          <FollowButton
            userId={member.id}
            initialIsFollowing={member.isFollowing}
            variant="compact"
          />
        )}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-sm">
      <div
        className="absolute inset-x-0 -top-12 h-24 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 opacity-80 pointer-events-none"
        aria-hidden
      />
      <div className="relative">
        <Link href={`/u/${member.id}`} className="flex flex-col items-center text-center">
          <Avatar
            name={member.name}
            email={member.email}
            src={member.avatarUrl || undefined}
            overlayUrl={member.avatarUrl ? undefined : member.companyLogoUrl || undefined}
            size={64}
            ring
          />
          <div className="mt-3 text-sm font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-1">
            {member.name}
          </div>
          {member.companyName && (
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {member.companyName}
            </div>
          )}
        </Link>
        {member.suggestionReason ? (
          <div className="mt-2 rounded-lg bg-emerald-50/60 border border-emerald-100 px-2 py-1.5 text-[10.5px] leading-snug text-emerald-800 italic line-clamp-2 text-center">
            “{member.suggestionReason}”
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>L{member.level.level}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{fmtNumber(member.xp)} XP</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{fmtNumber(member.followers)} fol.</span>
          </div>
        )}
        {!member.isMe && (
          <div className="mt-3 flex justify-center">
            <FollowButton
              userId={member.id}
              initialIsFollowing={member.isFollowing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
