"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

/**
 * Camera button overlaid on the avatar on /u/[id] when viewing your own
 * profile. Click → upload → PUT /api/profile/me with `avatarOverrideUrl`.
 */
export default function InlineAvatarEditor({ editable }: { editable: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!editable) return null;

  async function save(url: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarOverrideUrl: url }),
      });
      if (!r.ok) throw new Error("Save failed");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <ImageUploader uploadType="IMAGE" keyPrefix="academy/profile/avatar/" onUploaded={save}>
      {(open, uploading) => (
        <button
          type="button"
          onClick={open}
          disabled={uploading || busy}
          title="Change profile picture"
          className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 hover:ring-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 disabled:opacity-70"
        >
          {uploading || busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      )}
    </ImageUploader>
  );
}
