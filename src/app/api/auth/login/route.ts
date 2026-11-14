import { NextRequest, NextResponse } from "next/server";
import { cognitoAuthErrorMessage } from "@/lib/cognito/auth-errors";
import { completeNewPasswordChallenge, signInWithPassword } from "@/lib/cognito/user-auth";
import { normalizeSignInIdentifier } from "@/lib/cognito/username";
import { buildLoginSuccessResponse } from "@/lib/auth/finalize-login";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawIdentifier = String(body.username ?? body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!rawIdentifier || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const username = normalizeSignInIdentifier(rawIdentifier);
    const result = await signInWithPassword(username, password);

    if (result.kind === "new_password_required") {
      return NextResponse.json({
        challenge: "NEW_PASSWORD_REQUIRED",
        session: result.session,
        username: result.username,
        requiredAttributes: result.requiredAttributes,
      });
    }

    const redirectHint =
      typeof body.redirect === "string" && body.redirect.startsWith("/")
        ? body.redirect
        : null;
    return await buildLoginSuccessResponse(result.tokens, username, redirectHint);
  } catch (err) {
    console.error("POST /api/auth/login", err);
    const message = cognitoAuthErrorMessage(err);
    const status = /timeout|jwks|fetch/i.test(message) ? 503 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const rawIdentifier = String(body.username ?? body.email ?? "").trim();
    const newPassword = String(body.newPassword ?? "");
    const session = String(body.session ?? "");

    if (!rawIdentifier || !newPassword || !session) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAttributes =
      body.userAttributes && typeof body.userAttributes === "object"
        ? (Object.fromEntries(
            Object.entries(body.userAttributes as Record<string, unknown>).filter(
              (entry): entry is [string, string] =>
                typeof entry[0] === "string" && typeof entry[1] === "string",
            ),
          ) satisfies Record<string, string>)
        : undefined;

    const tokens = await completeNewPasswordChallenge({
      username: normalizeSignInIdentifier(rawIdentifier),
      newPassword,
      session,
      userAttributes,
    });

    const username = normalizeSignInIdentifier(rawIdentifier);
    const redirectHint =
      typeof body.redirect === "string" && body.redirect.startsWith("/")
        ? body.redirect
        : null;
    return buildLoginSuccessResponse(tokens, username, redirectHint);
  } catch (err) {
    console.error("PUT /api/auth/login", err);
    return NextResponse.json(
      { error: cognitoAuthErrorMessage(err) },
      { status: 400 },
    );
  }
}
