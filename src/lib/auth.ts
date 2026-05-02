import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken, type ZaptickJwtPayload } from "./jwt";
import dbConnect from "./db";
import User from "@/models/User";
import Company from "@/models/Company";
import { isPlanAllowed } from "./plan-gate";

export const ACADEMY_AUTH_COOKIE = "zaptick_token";

export async function getTokenFromCookies(): Promise<string | null> {
  const c = await cookies();
  // accept the same cookie names the main app sets so SSO from zaptick.io works
  return (
    c.get(ACADEMY_AUTH_COOKIE)?.value ||
    c.get("token")?.value ||
    c.get("zaptick-auth")?.value ||
    null
  );
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return (
    req.cookies.get(ACADEMY_AUTH_COOKIE)?.value ||
    req.cookies.get("token")?.value ||
    req.cookies.get("zaptick-auth")?.value ||
    null
  );
}

export async function getCurrentJwt(): Promise<ZaptickJwtPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export interface AcademyUser {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  role?: string;
  isSuperAdmin: boolean;
  isOwner: boolean;
  plan?: string;
  planAllowed: boolean;
  /** True for ZapAcademy staff (admin emails only). Drives /admin pages, mod tools. */
  isAdmin: boolean;
}

/**
 * ZapAcademy admin allowlist. Hard-coded to the founding team by default;
 * overridable via `ACADEMY_ADMIN_EMAILS=alice@zaptick.io,bob@zaptick.io`.
 * Email check is case-insensitive.
 */
const DEFAULT_ADMIN_EMAILS = ["aditya@zaptick.io", "shubhodeep@zaptick.io"];

function parseAdminEmails(): Set<string> {
  const raw = process.env.ACADEMY_ADMIN_EMAILS;
  const list = raw
    ? raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_ADMIN_EMAILS;
  return new Set(list);
}

export function isAcademyAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return parseAdminEmails().has(email.toLowerCase().trim());
}

/**
 * Resolve the current user along with their company plan.
 * Returns null if there is no valid session.
 */
export async function getCurrentUser(): Promise<AcademyUser | null> {
  const jwtPayload = await getCurrentJwt();
  if (!jwtPayload) return null;

  await dbConnect();

  const user = await User.findById(jwtPayload.id).lean<{
    _id: any;
    email: string;
    name: string;
    companyId?: any;
    role?: string;
    isSuperAdmin?: boolean;
    isOwner?: boolean;
  }>();
  if (!user) return null;

  let plan: string | undefined;
  if (user.companyId) {
    const company = await Company.findById(user.companyId)
      .select("subscriptionPlan subscriptionStatus")
      .lean<{ subscriptionPlan?: string; subscriptionStatus?: string }>();
    plan = company?.subscriptionPlan;
  }

  const isSuper = !!user.isSuperAdmin;
  const planAllowed = isSuper || isPlanAllowed(plan);

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    companyId: user.companyId?.toString(),
    role: user.role,
    isSuperAdmin: isSuper,
    isOwner: !!user.isOwner,
    plan,
    planAllowed,
    // Strict allowlist — only the configured ZapAcademy team members get the
    // admin surface (NOT every Zaptick company owner / role:admin). This is a
    // public community product, so admin powers stay with the team.
    isAdmin: isAcademyAdminEmail(user.email),
  };
}

export async function requireUser(): Promise<AcademyUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!user.planAllowed) throw new Error("PLAN_NOT_ALLOWED");
  return user;
}

export async function requireAdmin(): Promise<AcademyUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!user.isAdmin) throw new Error("FORBIDDEN");
  return user;
}
