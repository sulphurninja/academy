import Link from "next/link";
import { Settings, ExternalLink, UserCog, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const zaptickUrl = process.env.NEXT_PUBLIC_ZAPTICK_URL || "https://zaptick.io";
  return (
    <div className="space-y-4 max-w-3xl">
      <header>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
          <Settings className="h-3 w-3" /> Settings
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Account settings
        </h1>
      </header>

      <Link
        href="/settings/profile"
        className="group block relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
      >
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-100/70 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-300/40">
            <UserCog className="h-5 w-5 text-white" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">Edit your ZapAcademy profile</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                <Sparkles className="h-2.5 w-2.5" />
                New
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Cover image, bio, social handles, custom links, and a showcase of your
              products, posts, and affiliate links.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
            Open →
          </span>
        </div>
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-slate-900 mb-1">Account &amp; billing</h2>
        <p className="text-sm text-slate-500 mb-3">
          ZapAcademy uses your Zaptick account. Manage your name, email, password,
          plan, and billing on the main app.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${zaptickUrl}/settings/profile`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 h-10 text-sm font-bold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
          >
            Zaptick profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`${zaptickUrl}/wallet/plans`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 h-10 text-sm font-bold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
          >
            Plan &amp; billing <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
