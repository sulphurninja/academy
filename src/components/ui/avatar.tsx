"use client";

import * as React from "react";
import { cn, gradientFor, initials } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  /** Optional small overlay used for company brand. */
  overlayUrl?: string | null;
  ring?: boolean;
}

/**
 * Avatar primitive.
 * - Uses a plain <img> so it loads from any host (S3, scontent.whatsapp.net,
 *   favicons, etc) without requiring next.config remotePatterns entries.
 * - Falls back to a deterministic gradient + initials chip if the image fails
 *   or is missing.
 */
export function Avatar({
  name,
  email,
  src,
  size = 40,
  className,
  overlayUrl,
  ring,
}: AvatarProps) {
  const seed = email || name || "anon";
  const grad = gradientFor(seed);
  const label = initials(name || email);
  const [imgErrored, setImgErrored] = React.useState(false);
  const showImg = !!src && !imgErrored;
  const showOverlay = !!overlayUrl;
  const [overlayErrored, setOverlayErrored] = React.useState(false);

  // Reset error state when src changes (e.g. switching profiles in a list)
  React.useEffect(() => {
    setImgErrored(false);
  }, [src]);
  React.useEffect(() => {
    setOverlayErrored(false);
  }, [overlayUrl]);

  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          "h-full w-full rounded-full overflow-hidden flex items-center justify-center",
          "bg-gradient-to-br text-white font-bold",
          grad,
          ring && "ring-2 ring-white shadow-sm"
        )}
        style={{ fontSize: Math.max(11, Math.round(size * 0.36)) }}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src as string}
            alt={name || email || "avatar"}
            width={size}
            height={size}
            onError={() => setImgErrored(true)}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="select-none">{label}</span>
        )}
      </div>
      {showOverlay && !overlayErrored ? (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-[1.5px] ring-1 ring-slate-200"
          style={{
            width: Math.max(14, Math.round(size * 0.36)),
            height: Math.max(14, Math.round(size * 0.36)),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={overlayUrl as string}
            alt="company"
            onError={() => setOverlayErrored(true)}
            className="h-full w-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}
    </div>
  );
}
