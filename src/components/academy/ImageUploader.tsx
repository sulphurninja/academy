"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadResponse {
  success?: boolean;
  url?: string;
  handle?: string;
  type?: string;
  error?: string;
}

/**
 * Tiny wrapper around <input type="file"> that POSTs to /api/upload (which
 * proxies to the main Zaptick app's /api/upload-media S3 uploader) and
 * returns the resulting public URL via `onUploaded`.
 *
 * Works as either:
 *  - a styled <button> that opens the file picker (default)
 *  - a "render prop" via `children` for custom triggers (cover overlays etc).
 */
export interface ImageUploaderProps {
  /** Second arg is the original `File` when the browser provided one (for captions / filenames). */
  onUploaded: (url: string, file?: File) => void;
  /** Force the upstream uploader's "type" — almost always IMAGE. */
  uploadType?: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
  /** Pin into a specific S3 keyPrefix (e.g. "academy/{userId}/covers/"). */
  keyPrefix?: string;
  accept?: string;
  className?: string;
  label?: string;
  /** Render-prop alternative — receives `(open, isUploading)`. */
  children?: (open: () => void, isUploading: boolean) => React.ReactNode;
  /** Show a small inline error if the upload fails. */
  showErrorInline?: boolean;
  /** Parent can show a toast / banner (used when showErrorInline is false). */
  onUploadError?: (message: string) => void;
}

export default function ImageUploader({
  onUploaded,
  uploadType = "IMAGE",
  keyPrefix,
  accept = "image/*",
  className,
  label = "Upload image",
  children,
  showErrorInline = true,
  onUploadError,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    if (busy) return;
    setError(null);
    inputRef.current?.click();
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 64 * 1024 * 1024) {
      const msg = "File is over 64 MB.";
      setError(msg);
      onUploadError?.(msg);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", uploadType);
      if (keyPrefix) form.append("keyPrefix", keyPrefix);

      const r = await fetch("/api/upload", { method: "POST", body: form });
      const j: UploadResponse = await r.json().catch(() => ({}));
      if (!r.ok || !j.success || !j.url) {
        throw new Error(j.error || "Upload failed");
      }
      onUploaded(j.url, file);
    } catch (err: any) {
      const msg = err?.message || "Upload failed";
      setError(msg);
      onUploadError?.(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      {children ? (
        children(open, busy)
      ) : (
        <button
          type="button"
          onClick={open}
          disabled={busy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 px-3 h-9 text-xs font-bold text-slate-700 disabled:opacity-60",
            className
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" /> {label}
            </>
          )}
        </button>
      )}
      {showErrorInline && error && (
        <div className="mt-1 text-[11px] text-rose-600">{error}</div>
      )}
    </>
  );
}

/**
 * Variant: a "tap to upload" empty-state preview slot. Shows a 16:9-ish
 * dashed box with a camera icon when there's no image, or the image with a
 * "Replace" overlay when there is.
 */
export function ImageDropSlot({
  value,
  onChange,
  uploadType,
  keyPrefix,
  className,
  height = 180,
  alt = "Image",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  uploadType?: "IMAGE";
  keyPrefix?: string;
  className?: string;
  height?: number;
  alt?: string;
}) {
  return (
    <ImageUploader
      uploadType={uploadType}
      keyPrefix={keyPrefix}
      onUploaded={onChange}
    >
      {(open, busy) => (
        <button
          type="button"
          onClick={open}
          disabled={busy}
          style={{ height }}
          className={cn(
            "group relative w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-emerald-300 transition-colors",
            "flex items-center justify-center text-center",
            className
          )}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={alt}
                className="absolute inset-0 h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-white px-3 h-8 text-xs font-bold text-slate-800">
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" /> Replace image
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500">
              {busy ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
              ) : (
                <ImagePlus className="mx-auto h-6 w-6 text-slate-400" />
              )}
              <div className="mt-1 text-[12px] font-bold">
                {busy ? "Uploading…" : "Click to upload"}
              </div>
              <div className="text-[10px] text-slate-400">PNG / JPG / WebP up to 64MB</div>
            </div>
          )}
        </button>
      )}
    </ImageUploader>
  );
}
