import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Upload proxy → main Zaptick app.
 *
 * The browser POSTs FormData to this academy endpoint, we forward it (along
 * with the shared `token` cookie) to `${ZAPTICK_URL}/api/upload-media` which
 * handles S3 + format conversion. Same origin from the browser's perspective
 * so no CORS dance.
 *
 * Body (FormData):
 *   file:      File
 *   type:      "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO"
 *   keyPrefix: optional string (we default to "academy/{userId}/")
 *
 * Response: { success, url, handle, type } from the upstream.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const upstreamBase =
    process.env.NEXT_PUBLIC_ZAPTICK_URL ||
    process.env.ZAPTICK_URL ||
    "https://zaptick.io";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || cookieStore.get("zaptick_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Missing Zaptick auth token. Please re-login." },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Bad form data" }, { status: 400 });
  }

  // If the caller didn't set keyPrefix, namespace into academy/{userId}/
  if (!formData.get("keyPrefix")) {
    formData.set("keyPrefix", `academy/${user.id}/`);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${upstreamBase}/api/upload-media`, {
      method: "POST",
      body: formData,
      headers: {
        // Zaptick reads the `token` cookie via request.cookies — forward it.
        Cookie: `token=${token}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Upload upstream failed", detail: err?.message },
      { status: 502 }
    );
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
