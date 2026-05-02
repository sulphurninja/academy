"use client";

import Link from "next/link";
import { Trophy, Medal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { fmtNumber, cn } from "@/lib/utils";

interface Row {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  companyLogoUrl?: string | null;
  companyName?: string;
  xp: number;
  level: number;
  rank: number;
}

export default function LeaderboardTable({
  rows,
  meId,
}: {
  rows: Row[];
  meId: string;
}) {
  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <Trophy className="mx-auto h-7 w-7 text-slate-400" />
        <div className="mt-2 text-sm text-slate-600">
          Leaderboard fills up as soon as members start earning XP.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left font-bold">#</th>
            <th className="px-4 py-3 text-left font-bold">Member</th>
            <th className="px-4 py-3 text-left font-bold">Level</th>
            <th className="px-4 py-3 text-right font-bold">XP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isMe = r.userId === meId;
            const trophy = r.rank === 1 ? "text-amber-500" : r.rank === 2 ? "text-slate-400" : r.rank === 3 ? "text-amber-700" : "";
            return (
              <tr
                key={r.userId}
                className={cn(
                  "border-t border-slate-100 transition-colors",
                  isMe ? "bg-emerald-50/60" : "hover:bg-slate-50"
                )}
              >
                <td className="px-4 py-3 font-bold text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    {r.rank <= 3 ? <Medal className={cn("h-4 w-4", trophy)} /> : null}
                    #{r.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/u/${r.userId}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar
                      name={r.name}
                      email={r.email}
                      src={r.avatarUrl || undefined}
                      overlayUrl={r.avatarUrl ? undefined : r.companyLogoUrl || undefined}
                      size={36}
                    />
                    <div className="leading-tight">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                        {r.name}
                        {isMe && (
                          <span className="ml-2 text-[10px] uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-0.5">
                            you
                          </span>
                        )}
                      </div>
                      {r.companyName && (
                        <div className="text-[11px] text-slate-500">{r.companyName}</div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">L{r.level}</td>
                <td className="px-4 py-3 text-right font-extrabold text-amber-600">
                  {fmtNumber(r.xp)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
