import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { createToken } from "@/lib/jwt";
import { isPlanAllowed, planLabel } from "@/lib/plan-gate";
import { ACADEMY_AUTH_COOKIE } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid work email." },
        { status: 400 }
      );
    }
    if (!trimmedPassword) {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return NextResponse.json(
        {
          error:
            "We couldn't find an account with that email. Sign up at zaptick.io first, then come back here.",
        },
        { status: 404 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        {
          error:
            "This account has been deactivated. Please contact support@zaptick.io.",
        },
        { status: 403 }
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Account is temporarily locked. Try again later." },
        { status: 423 }
      );
    }

    const ok = await user.comparePassword(trimmedPassword);
    if (!ok) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // Plan check — only Growth / Growth+ can access ZapAcademy
    let plan: string | undefined;
    if (user.companyId) {
      const company = await Company.findById(user.companyId)
        .select("subscriptionPlan")
        .lean<{ subscriptionPlan?: string }>();
      plan = company?.subscriptionPlan;
    }

    const allowed = !!user.isSuperAdmin || isPlanAllowed(plan);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `ZapAcademy is exclusive to Growth and Growth+ plans. Your current plan: ${planLabel(plan)}. Upgrade at zaptick.io/wallet/plans to unlock the academy.`,
          code: "PLAN_NOT_ALLOWED",
          plan,
        },
        { status: 403 }
      );
    }

    const token = createToken({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      isOwner: user.isOwner,
      companyId: user.companyId,
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan,
        isAdmin:
          !!user.isSuperAdmin ||
          user.role === "admin" ||
          user.role === "owner",
      },
    });

    res.cookies.set(ACADEMY_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });

    return res;
  } catch (err: any) {
    console.error("[zapacademy] login error:", err?.message || err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
