"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RemoveBookmarkButton({
  weekSlug,
  lessonSlug,
}: {
  weekSlug: string;
  lessonSlug: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      // Toggle endpoint — POST again to remove since one already exists.
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, lessonSlug }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      title="Remove bookmark"
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
