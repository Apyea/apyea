import { NextRequest, NextResponse } from "next/server";
import { cognitoAuthErrorMessage } from "@/lib/cognito/auth-errors";
import { confirmForgotPassword, requestForgotPassword } from "@/lib/cognito/user-auth";
import { normalizeSignInIdentifier } from "@/lib/cognito/username";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = String(body.username ?? body.email ?? "").trim();
    if (!raw) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    await requestForgotPassword(normalizeSignInIdentifier(raw));
    return NextResponse.json({
      ok: true,
      message: "If an account exists, a reset code has been sent to your email.",
    });
  } catch (err) {
    console.error("POST /api/auth/forgot-password", err);
    return NextResponse.json(
      { error: cognitoAuthErrorMessage(err) },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = String(body.username ?? body.email ?? "").trim();
    const code = String(body.code ?? "").trim();
    const newPassword = String(body.newPassword ?? "");

    if (!raw || !code || !newPassword) {
      return NextResponse.json({ error: "Username, code, and new password are required" }, { status: 400 });
    }

    await confirmForgotPassword({
      username: normalizeSignInIdentifier(raw),
      code,
      newPassword,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/auth/forgot-password", err);
    return NextResponse.json(
      { error: cognitoAuthErrorMessage(err) },
      { status: 400 },
    );
  }
}
