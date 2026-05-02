"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ImagePlus,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Github,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUpRight,
  Save,
  GripVertical,
  Sparkles,
  Tag,
  Megaphone,
  ShoppingBag,
  Link2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import ImageUploader from "@/components/academy/ImageUploader";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
  id: string;
  kind: "product" | "affiliate" | "post" | "link";
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  cta?: string;
  badge?: string;
  tag?: string;
  order?: number;
}

interface Socials {
  website?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  github?: string;
  whatsapp?: string;
  threads?: string;
  custom?: { id: string; label: string; url: string; icon?: string }[];
}

interface ProfileShape {
  headline?: string;
  bio?: string;
  coverUrl?: string;
  avatarOverrideUrl?: string;
  location?: string;
  socials: Socials;
  showcase: ShowcaseItem[];
}

interface MemberLite {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  companyLogoUrl: string | null;
  companyName: string | null;
}

interface Props {
  member: MemberLite;
  initial: ProfileShape;
}

const SHOWCASE_KINDS: {
  id: ShowcaseItem["kind"];
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  { id: "product", label: "Product", icon: <ShoppingBag className="h-3.5 w-3.5" />, desc: "Your own product / SaaS" },
  { id: "affiliate", label: "Affiliate", icon: <Megaphone className="h-3.5 w-3.5" />, desc: "Affiliate / referral link" },
  { id: "post", label: "Post", icon: <FileText className="h-3.5 w-3.5" />, desc: "Article, case study, video" },
  { id: "link", label: "Link", icon: <Link2 className="h-3.5 w-3.5" />, desc: "Generic link" },
];

const SOCIAL_FIELDS: {
  key: keyof Omit<Socials, "custom">;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}[] = [
  { key: "website", label: "Website", placeholder: "https://yourbrand.com", icon: <Globe className="h-3.5 w-3.5" /> },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle", icon: <Instagram className="h-3.5 w-3.5" /> },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname", icon: <Linkedin className="h-3.5 w-3.5" /> },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/yourhandle", icon: <SocialIconX /> },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel", icon: <Youtube className="h-3.5 w-3.5" /> },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage", icon: <Facebook className="h-3.5 w-3.5" /> },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle", icon: <SocialIconTikTok /> },
  { key: "threads", label: "Threads", placeholder: "https://threads.net/@yourhandle", icon: <SocialIconThreads /> },
  { key: "github", label: "GitHub", placeholder: "https://github.com/yourhandle", icon: <Github className="h-3.5 w-3.5" /> },
  { key: "whatsapp", label: "WhatsApp link", placeholder: "https://wa.me/91XXXXXXXXXX", icon: <SocialIconWA /> },
];

export default function ProfileEditorClient({ member, initial }: Props) {
  const [headline, setHeadline] = useState(initial.headline || "");
  const [bio, setBio] = useState(initial.bio || "");
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl || "");
  const [avatarOverrideUrl, setAvatarOverrideUrl] = useState(initial.avatarOverrideUrl || "");
  const [location, setLocation] = useState(initial.location || "");
  const [socials, setSocials] = useState<Socials>(initial.socials || {});
  const [showcase, setShowcase] = useState<ShowcaseItem[]>(initial.showcase || []);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewAvatar = avatarOverrideUrl || member.avatarUrl;

  function setSocial<K extends keyof Socials>(key: K, value: Socials[K]) {
    setSocials((prev) => ({ ...prev, [key]: value }));
  }

  function addCustomLink() {
    setSocials((prev) => ({
      ...prev,
      custom: [
        ...(prev.custom || []),
        { id: crypto.randomUUID?.() || `${Date.now()}`, label: "", url: "" },
      ].slice(0, 8),
    }));
  }

  function updateCustomLink(id: string, patch: Partial<{ label: string; url: string }>) {
    setSocials((prev) => ({
      ...prev,
      custom: (prev.custom || []).map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  }

  function removeCustomLink(id: string) {
    setSocials((prev) => ({
      ...prev,
      custom: (prev.custom || []).filter((c) => c.id !== id),
    }));
  }

  function addShowcase() {
    setShowcase((prev) => {
      const next: ShowcaseItem = {
        id: crypto.randomUUID?.() || `${Date.now()}`,
        kind: "product",
        title: "",
        url: "",
        order: prev.length,
      };
      return [...prev, next].slice(0, 24);
    });
  }

  function updateShowcase(id: string, patch: Partial<ShowcaseItem>) {
    setShowcase((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function removeShowcase(id: string) {
    setShowcase((prev) => prev.filter((it) => it.id !== id));
  }

  function moveShowcase(id: string, dir: -1 | 1) {
    setShowcase((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      const [it] = next.splice(idx, 1);
      next.splice(j, 0, it);
      return next.map((it, i) => ({ ...it, order: i }));
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const r1 = await fetch("/api/profile/me", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            headline,
            bio,
            coverUrl,
            avatarOverrideUrl,
            location,
            socials,
          }),
        });
        if (!r1.ok) throw new Error("Failed to save profile");

        const r2 = await fetch("/api/profile/me/showcase", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items: showcase }),
        });
        if (!r2.ok) throw new Error("Failed to save showcase");

        setSavedAt(Date.now());
      } catch (e: any) {
        setError(e?.message || "Save failed");
      }
    });
  }

  const profileUrl = `/u/${member.id}`;

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
            <Sparkles className="h-3 w-3" /> Profile editor
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Make your ZapAcademy profile yours
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Cover, bio, social handles, links, and a showcase of your products,
            offers, and content. Everyone in the cohort sees this on{" "}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 hover:underline"
            >
              your public profile
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 h-10 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
          >
            View public profile
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            disabled={pending}
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 h-10 text-sm font-extrabold text-white shadow-sm disabled:opacity-60"
          >
            {pending ? "Saving…" : (
              <>
                <Save className="h-3.5 w-3.5" /> Save changes
              </>
            )}
          </button>
        </div>
      </header>

      {savedAt && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── Hero preview ───────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div
          className={cn(
            "relative h-44 sm:h-56 bg-gradient-to-br from-emerald-100 via-cyan-50 to-amber-50",
            coverUrl && "bg-cover bg-center"
          )}
          style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <ImageUploader
              uploadType="IMAGE"
              keyPrefix="academy/profile/cover/"
              onUploaded={(url) => setCoverUrl(url)}
              className="!bg-white/95 !backdrop-blur-sm !border-white/40 !text-slate-800 hover:!bg-white"
              label={coverUrl ? "Replace cover" : "Upload cover"}
            />
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="rounded-xl bg-white/95 hover:bg-white border border-white/40 h-9 px-2.5 text-[11px] font-bold text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="px-6 -mt-12 pb-6">
          <div className="flex items-end gap-4">
            <div className="relative inline-block">
              <Avatar
                name={member.name}
                email={member.email}
                src={previewAvatar || undefined}
                overlayUrl={previewAvatar ? undefined : member.companyLogoUrl || undefined}
                size={96}
                ring
                className="ring-4 ring-white"
              />
              <ImageUploader
                uploadType="IMAGE"
                keyPrefix="academy/profile/avatar/"
                onUploaded={(url) => setAvatarOverrideUrl(url)}
              >
                {(open, busyUpload) => (
                  <button
                    type="button"
                    onClick={open}
                    disabled={busyUpload}
                    title="Change profile picture"
                    className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 hover:ring-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 disabled:opacity-70"
                  >
                    {busyUpload ? (
                      <span className="h-4 w-4 inline-block rounded-full border-2 border-emerald-600 border-r-transparent animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    )}
                  </button>
                )}
              </ImageUploader>
            </div>
            <div className="pb-2 min-w-0 flex-1">
              <div className="text-xl font-black text-slate-900 truncate">{member.name}</div>
              <div className="text-xs text-slate-500 truncate">
                {headline || (member.companyName ? `at ${member.companyName}` : "Add a headline")}
              </div>
              {avatarOverrideUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarOverrideUrl("")}
                  className="mt-1 text-[11px] text-slate-400 hover:text-rose-600 underline-offset-2 hover:underline"
                >
                  Reset to WhatsApp profile picture
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────── */}
      <Section title="About you" subtitle="Headline, bio, where you're from.">
        <Field label="Headline" hint="Short tagline shown under your name (e.g. 'Founder, Bloomroom · D2C Beauty').">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            maxLength={140}
            placeholder="Founder, Bloomroom · D2C Beauty"
            className={inputCx}
          />
          <Counter value={headline} max={140} />
        </Field>

        <Field label="Bio" hint="Markdown-ish; rendered as plain text. Tell people what you build, sell, or geek out about.">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="I run a 9-figure D2C skincare brand. We send 4M+ WhatsApp messages every month. Happy to swap notes on retention, pricing, and the cold start problem."
            className={cn(inputCx, "min-h-[120px] py-2.5")}
          />
          <Counter value={bio} max={2000} />
        </Field>

        <Field label="Location" hint="Optional. Helps people find IRL collaborators.">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
            placeholder="Bengaluru, India"
            className={inputCx}
          />
        </Field>
      </Section>

      {/* ── Socials ────────────────────────────────────────────────── */}
      <Section
        title="Social links"
        subtitle="Drop your handles. We'll render the right icons on your profile."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <span className="text-slate-500">{f.icon}</span>
                {f.label}
              </span>
              <input
                type="url"
                value={socials[f.key] || ""}
                onChange={(e) => setSocial(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={inputCx}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-bold text-slate-900">Custom links</div>
              <div className="text-xs text-slate-500">
                Anything not covered above. Newsletter, Substack, Calendly, Discord,
                podcast — up to 8.
              </div>
            </div>
            <button
              type="button"
              onClick={addCustomLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 h-9 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <Plus className="h-3.5 w-3.5" /> Add link
            </button>
          </div>
          <div className="space-y-2">
            {(socials.custom || []).map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center"
              >
                <input
                  value={c.label}
                  onChange={(e) => updateCustomLink(c.id, { label: e.target.value })}
                  placeholder="Label (e.g. Substack)"
                  className={inputCx}
                />
                <input
                  value={c.url}
                  onChange={(e) => updateCustomLink(c.id, { url: e.target.value })}
                  placeholder="https://…"
                  className={inputCx}
                />
                <button
                  type="button"
                  onClick={() => removeCustomLink(c.id)}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {(!socials.custom || socials.custom.length === 0) && (
              <div className="text-xs text-slate-400 italic">No custom links yet.</div>
            )}
          </div>
        </div>
      </Section>

      {/* ── Showcase / Affiliate links ─────────────────────────────── */}
      <Section
        title="Showcase"
        subtitle="Pin your products, affiliate links, posts, and offers. Each one renders as a beautiful card on your public profile."
        right={
          <button
            type="button"
            onClick={addShowcase}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 h-9 text-xs font-extrabold text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        }
      >
        {showcase.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
            <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto" />
            <div className="mt-2 text-sm font-bold text-slate-700">
              Nothing in your showcase yet
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Add your products, courses, affiliate links, articles, or offers.
            </div>
            <button
              type="button"
              onClick={addShowcase}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 h-10 text-sm font-extrabold text-white"
            >
              <Plus className="h-4 w-4" /> Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {showcase.map((it, idx) => (
              <ShowcaseRow
                key={it.id}
                item={it}
                index={idx}
                count={showcase.length}
                onChange={(patch) => updateShowcase(it.id, patch)}
                onRemove={() => removeShowcase(it.id)}
                onMove={(dir) => moveShowcase(it.id, dir)}
              />
            ))}
          </div>
        )}
      </Section>

      <div className="flex justify-end">
        <button
          disabled={pending}
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 h-11 text-sm font-extrabold text-white shadow-sm disabled:opacity-60"
        >
          {pending ? "Saving…" : (
            <>
              <Save className="h-4 w-4" /> Save changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── helpers ───────────────────────────────────────────────────────── */

const inputCx =
  "w-full rounded-xl border border-slate-200 bg-white px-3 h-10 text-sm placeholder:text-slate-400 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

function Section({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      {hint && <span className="block text-[11px] text-slate-500 mt-0.5 mb-1.5">{hint}</span>}
      <div className="relative">{children}</div>
    </label>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <div className="text-[10px] text-slate-400 mt-1 text-right tabular-nums">
      {value.length}/{max}
    </div>
  );
}

function ShowcaseRow({
  item,
  index,
  count,
  onChange,
  onRemove,
  onMove,
}: {
  item: ShowcaseItem;
  index: number;
  count: number;
  onChange: (patch: Partial<ShowcaseItem>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const kind = useMemo(
    () => SHOWCASE_KINDS.find((k) => k.id === item.kind) || SHOWCASE_KINDS[0],
    [item.kind]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="h-6 w-6 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30"
            aria-label="Move up"
          >
            ▲
          </button>
          <GripVertical className="h-3.5 w-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            className="h-6 w-6 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30"
            aria-label="Move down"
          >
            ▼
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {SHOWCASE_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => onChange({ kind: k.id })}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 h-7 text-[11px] font-bold transition-colors",
                  item.kind === k.id
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
                title={k.desc}
              >
                {k.icon}
                {k.label}
              </button>
            ))}
            <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-slate-400">
              {kind.label}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <input
              value={item.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Title (e.g. Bloomroom Vitamin C Serum)"
              className={inputCx}
            />
            <input
              value={item.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://your-link"
              className={inputCx}
            />
          </div>
          <textarea
            value={item.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Optional short description (max 400 chars)"
            rows={2}
            className={cn(inputCx, "mt-2 min-h-[60px] py-2")}
          />
          <div className="grid sm:grid-cols-3 gap-2 mt-2">
            <div className="flex items-center gap-2">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 ring-1 ring-slate-200 inline-flex items-center justify-center">
                  <ImagePlus className="h-4 w-4 text-slate-400" />
                </div>
              )}
              <ImageUploader
                uploadType="IMAGE"
                keyPrefix="academy/profile/showcase/"
                onUploaded={(url) => onChange({ imageUrl: url })}
                className="!h-10 !w-full"
                label={item.imageUrl ? "Replace" : "Upload image"}
              />
            </div>
            <input
              value={item.cta || ""}
              onChange={(e) => onChange({ cta: e.target.value })}
              placeholder="CTA label (Shop, Read, Try)"
              className={inputCx}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={item.badge || ""}
                onChange={(e) => onChange({ badge: e.target.value })}
                placeholder="Badge (10% off)"
                className={inputCx}
              />
              <input
                value={item.tag || ""}
                onChange={(e) => onChange({ tag: e.target.value })}
                placeholder="Tag (skincare)"
                className={inputCx}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              {item.tag && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  <Tag className="h-3 w-3" />
                  {item.tag}
                </span>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                >
                  Test link <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ imageUrl: undefined })}
                  className="text-rose-600 hover:underline underline-offset-2"
                >
                  Remove image
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 h-8 text-[11px] font-bold text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── tiny brand icons not in lucide-react ──────────────────────────── */

function SocialIconX() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M18.244 2H21.5l-7.453 8.514L23 22h-6.84l-5.353-6.997L4.7 22H1.44l7.96-9.105L1 2h6.99l4.84 6.4L18.243 2Zm-2.398 18h1.806L7.273 4H5.34l10.506 16Z" />
    </svg>
  );
}
function SocialIconTikTok() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M16.5 3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5v6.75a6.75 6.75 0 1 1-6.75-6.75c.255 0 .505.014.75.04V12a3.75 3.75 0 1 0 3 3.675V3h3Z" />
    </svg>
  );
}
function SocialIconThreads() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M12 2C6.5 2 2 6 2 11.4c0 5.5 3.6 10.6 10 10.6 5.5 0 9.6-3.7 9.6-9.4 0-5.5-3.4-8.4-7.7-8.4-3.6 0-6 2-6.7 4.5l1.7.6c.5-1.7 2.1-3 4.8-3 3 0 5 2.1 5 5.6 0 4-2.7 6.5-7.1 6.5-4.4 0-7.5-3.5-7.5-8.2C4.1 6.4 7.5 4 12 4c2.7 0 5.1.9 7.1 2.7l1-1.4C17.8 3.1 15 2 12 2Z" />
    </svg>
  );
}
function SocialIconWA() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.412 3.488 11.82 11.82 0 0 1 3.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
