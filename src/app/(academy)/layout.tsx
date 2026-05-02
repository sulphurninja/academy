import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { tickStreak } from "@/lib/engine";
import { getMember } from "@/lib/profile";
import AcademyShell from "@/components/layout/AcademyShell";
import dbConnect from "@/lib/db";
import Streak from "@/models/Streak";
import { planLabel } from "@/lib/plan-gate";

export const dynamic = "force-dynamic";

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!user.planAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h1 className="mt-4 text-xl font-black text-slate-900">
            Upgrade to access ZapAcademy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            ZapAcademy is exclusive to Growth and Growth+ plans. Your plan:{" "}
            <span className="font-bold text-slate-900">{planLabel(user.plan)}</span>.
          </p>
          <Link
            href={`${process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io"}/wallet/plans`}
            className="inline-flex items-center justify-center mt-6 px-5 h-11 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-[#1a1100] text-sm font-black shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform gold-glow"
          >
            Upgrade plan →
          </Link>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <button className="text-xs text-slate-400 hover:text-slate-700">
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Tick streak on every authenticated page render — idempotent within a day
  await dbConnect();
  await tickStreak(user.id);
  const [member, streak] = await Promise.all([
    getMember(user.id),
    Streak.findOne({ userId: user.id }).lean<{ current: number; longest: number }>(),
  ]);

  if (!member) redirect("/login");

  return (
    <AcademyShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        avatarUrl: member.avatarUrl,
        companyLogoUrl: member.companyLogoUrl,
        companyName: member.companyName,
      }}
      xp={member.xp}
      level={member.level}
      streak={streak?.current || 0}
    >
      {children}
    </AcademyShell>
  );
}
