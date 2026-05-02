import jwt from "jsonwebtoken";

/**
 * NOTE: same JWT_SECRET as the main Zaptick app. A token issued by either app
 * is accepted by both — that's how SSO between zaptick.io and academy.zaptick.io
 * works without an extra round-trip.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export interface ZaptickJwtPayload {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isSuperAdmin?: boolean;
  isOwner?: boolean;
  companyId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Mirrors the main app's `createToken` payload shape so a token issued here
 * works on zaptick.io too.
 */
export function createToken(user: {
  _id: any;
  email: string;
  name?: string;
  role?: string;
  isSuperAdmin?: boolean;
  isOwner?: boolean;
  companyId?: any;
}): string {
  const payload: ZaptickJwtPayload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    isSuperAdmin: user.isSuperAdmin || false,
    isOwner: user.isOwner || false,
    companyId: user.companyId?.toString(),
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): ZaptickJwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as ZaptickJwtPayload;
  } catch {
    return null;
  }
}
