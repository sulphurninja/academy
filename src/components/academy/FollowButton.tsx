"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  variant?: "default" | "compact";
  onChange?: (following: boolean) => void;
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  variant = "default",
  onChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    onChange?.(next);
    start(async () => {
      try {
        await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action: next ? "follow" : "unfollow" }),
        });
      } catch {
        // revert on error
        setFollowing(!next);
        onChange?.(!next);
      }
    });
  }

  const isCompact = variant === "compact";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold transition-all active:scale-[0.98]",
        isCompact ? "h-7 px-3 text-[11px]" : "h-9 px-4 text-xs",
        following
          ? "bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          : "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900"
      )}
    >
      {pending ? (
        <Loader2 className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5", "animate-spin")} />
      ) : following ? (
        <UserCheck className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
      ) : (
        <UserPlus className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
      )}
      <span>{following ? "Following" : "Follow"}</span>
    </button>
  );
}
