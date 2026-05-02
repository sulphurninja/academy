"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

/**
 * Wraps the cover hero on /u/[id]. When `editable` is true (viewing your own
 * profile), shows a camera icon on hover that opens a file picker. The
 * uploaded URL is PUT'd to /api/profile/me and the page refreshes.
 *
 * The cover background image itself is rendered server-side; this component
 * just absolute-positions an overlay on top of it.
 */
export default function InlineCoverEditor({
  editable,
  hasCover,
}: {
  editable: boolean;
  hasCover: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!editable) return null;

  async function setCover(url: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverUrl: url }),
      });
      if (!r.ok) throw new Error("Save failed");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeCover() {
    if (!confirm("Remove your cover image?")) return;
    await setCover("");
  }

  return (
    <div className="absolute inset-0 group/cover">
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-colors pointer-events-none" />

      {/* Centered camera button — visible on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
        <ImageUploader
          uploadType="IMAGE"
          keyPrefix="academy/profile/cover/"
          onUploaded={setCover}
        >
          {(open, uploading) => (
            <button
              type="button"
              onClick={open}
              disabled={uploading || busy}
              className="inline-flex items-center gap-2 rounded-full bg-white/95 hover:bg-white px-4 h-10 text-xs font-extrabold text-slate-900 shadow-lg ring-1 ring-black/5 disabled:opacity-70"
            >
              {uploading || busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {busy ? "Saving…" : "Uploading…"}
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  {hasCover ? "Change cover" : "Add cover"}
                </>
              )}
            </button>
          )}
        </ImageUploader>
      </div>

      {/* Remove button — top right corner, only when cover exists */}
      {hasCover && (
        <button
          type="button"
          onClick={removeCover}
          disabled={busy}
          title="Remove cover"
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-700 ring-1 ring-black/5 shadow opacity-0 group-hover/cover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
