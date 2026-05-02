"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Link2,
  Loader2,
  X,
  Trophy,
  Film,
  Paperclip,
} from "lucide-react";
import {
  PiLinkedinLogoFill,
  PiTwitterLogoFill,
  PiInstagramLogoFill,
  PiYoutubeLogoFill,
} from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import ImageUploader from "@/components/academy/ImageUploader";

interface PostComposerProps {
  me: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    companyLogoUrl?: string | null;
  };
  onPosted?: () => void;
  /** Optional context — e.g. composer rendered on a lesson page */
  weekSlug?: string;
  lessonSlug?: string;
}

const SOCIAL_PRESETS: { icon: any; label: string; type: string; placeholder: string; color: string }[] = [
  { icon: PiLinkedinLogoFill, label: "LinkedIn", type: "linkedin", placeholder: "https://linkedin.com/posts/…", color: "text-[#0A66C2]" },
  { icon: PiTwitterLogoFill, label: "X / Twitter", type: "twitter", placeholder: "https://x.com/…", color: "text-slate-900" },
  { icon: PiInstagramLogoFill, label: "Instagram", type: "instagram", placeholder: "https://instagram.com/p/…", color: "text-[#E1306C]" },
  { icon: PiYoutubeLogoFill, label: "YouTube", type: "youtube", placeholder: "https://youtu.be/…", color: "text-[#FF0000]" },
];

type UploadKind = "image" | "file" | "video";

interface LocalUpload {
  url: string;
  kind: UploadKind;
  fileName?: string;
}

const COMMUNITY_KEY_PREFIX = (userId: string) => `academy/${userId}/community/`;

const DOC_ACCEPT =
  "application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function PostComposer({ me, onPosted, weekSlug, lessonSlug }: PostComposerProps) {
  const [body, setBody] = useState("");
  const [showLink, setShowLink] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [upload, setUpload] = useState<LocalUpload | null>(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareWin, setShareWin] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function clearSocial() {
    setShowLink(null);
    setLinkUrl("");
    setLinkTitle("");
  }

  function clearUpload() {
    setUpload(null);
    setMediaCaption("");
    setUploadError(null);
  }

  async function publish() {
    if (!body.trim()) {
      setError("Say something first ✍️");
      return;
    }
    setPosting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        body: body.trim(),
        weekSlug,
        lessonSlug,
      };
      if (upload) {
        const cap = mediaCaption.trim();
        payload.attachment = {
          url: upload.url,
          type: upload.kind,
          title:
            cap ||
            upload.fileName ||
            (upload.kind === "image" ? "Photo" : upload.kind === "video" ? "Video" : "File"),
          imageUrl: upload.kind === "image" ? upload.url : undefined,
        };
      } else if (showLink && linkUrl.trim()) {
        payload.attachment = {
          url: linkUrl.trim(),
          type: showLink,
          title: linkTitle.trim() || undefined,
        };
      }
      const r = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error || "Could not publish");
      } else {
        setBody("");
        clearSocial();
        clearUpload();
        setShareWin(false);
        onPosted?.();
      }
    } finally {
      setPosting(false);
    }
  }

  const keyPrefix = COMMUNITY_KEY_PREFIX(me.id);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <Avatar
          name={me.name}
          email={me.email}
          src={me.avatarUrl || undefined}
          overlayUrl={me.avatarUrl ? undefined : me.companyLogoUrl || undefined}
          size={40}
        />
        <div className="flex-1 min-w-0">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Drop a win, share a question, or post a tip the cohort needs…"
            rows={3}
            className="min-h-[88px] border-0 focus-visible:ring-0 resize-none px-0 py-1 text-[15px]"
          />

          {upload && (
            <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
              <div className="flex items-start gap-3">
                {upload.kind === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={upload.url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                {upload.kind === "video" && (
                  <video
                    src={upload.url}
                    muted
                    playsInline
                    className="h-16 w-28 shrink-0 rounded-lg object-cover ring-1 ring-white shadow-sm bg-black"
                  />
                )}
                {upload.kind === "file" && (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                    <Paperclip className="h-6 w-6 text-slate-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {upload.fileName || (upload.kind === "image" ? "Image" : upload.kind === "video" ? "Video" : "Document")}
                  </div>
                  <input
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    placeholder="Optional caption"
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearUpload}
                  className="shrink-0 text-slate-400 hover:text-slate-700"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Uploaded via Zaptick · stored on your workspace media
              </p>
            </div>
          )}

          {showLink && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Attach {showLink}
                </span>
                <button
                  onClick={() => {
                    clearSocial();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={SOCIAL_PRESETS.find((s) => s.type === showLink)?.placeholder || "https://…"}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-2"
              />
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Optional caption (e.g. 'Closed my first ₹50K retainer this week')"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {error && <div className="mt-2 text-xs font-semibold text-rose-600">{error}</div>}
          {uploadError && <div className="mt-2 text-xs font-semibold text-rose-600">{uploadError}</div>}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <ImageUploader
                uploadType="IMAGE"
                keyPrefix={keyPrefix}
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.heic"
                showErrorInline={false}
                onUploadError={setUploadError}
                onUploaded={(url, file) => {
                  clearSocial();
                  setUploadError(null);
                  setUpload({ url, kind: "image", fileName: file?.name });
                }}
              >
                {(open, busy) => (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      open();
                    }}
                    disabled={busy || !!upload}
                    title="Upload image from device"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  </button>
                )}
              </ImageUploader>

              <ImageUploader
                uploadType="VIDEO"
                keyPrefix={keyPrefix}
                accept="video/mp4,video/quicktime,video/x-m4v,.mp4,.mov,.m4v"
                showErrorInline={false}
                onUploadError={setUploadError}
                onUploaded={(url, file) => {
                  clearSocial();
                  setUploadError(null);
                  setUpload({ url, kind: "video", fileName: file?.name });
                }}
              >
                {(open, busy) => (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      open();
                    }}
                    disabled={busy || !!upload}
                    title="Upload video from device"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                  </button>
                )}
              </ImageUploader>

              <ImageUploader
                uploadType="DOCUMENT"
                keyPrefix={keyPrefix}
                accept={DOC_ACCEPT}
                showErrorInline={false}
                onUploadError={setUploadError}
                onUploaded={(url, file) => {
                  clearSocial();
                  setUploadError(null);
                  setUpload({ url, kind: "file", fileName: file?.name });
                }}
              >
                {(open, busy) => (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      open();
                    }}
                    disabled={busy || !!upload}
                    title="Upload PDF or document"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </button>
                )}
              </ImageUploader>

              <span className="mx-0.5 h-5 w-px bg-slate-200 hidden sm:inline-block" aria-hidden />

              {SOCIAL_PRESETS.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => {
                    clearUpload();
                    setUploadError(null);
                    setShowLink(s.type);
                  }}
                  disabled={!!upload}
                  title={`Attach ${s.label}`}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 ${s.color}`}
                >
                  <s.icon className="h-4 w-4" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  clearUpload();
                  setUploadError(null);
                  setShowLink("blog");
                }}
                disabled={!!upload}
                title="Attach a link"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShareWin((s) => !s)}
                title="Tag as a win"
                className={`inline-flex h-8 px-2.5 items-center gap-1.5 rounded-lg border text-[11px] font-bold ${
                  shareWin
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                Win
              </button>
            </div>
            <Button onClick={publish} disabled={posting} className="gap-2 shrink-0">
              {posting && <Loader2 className="h-4 w-4 animate-spin" />}
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
