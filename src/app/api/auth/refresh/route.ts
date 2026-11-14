import { NextRequest, NextResponse } from "next/server";
import { cognitoAuthErrorMessage } from "@/lib/cognito/auth-errors";
import { refreshAccessToken } from "@/lib/cognito/user-auth";
import {
  getCognitoUsernameFromRequest,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshTokenFromRequest(request);
  const cognitoUsername = getCognitoUsernameFromRequest(request);

  if (!refreshToken || !cognitoUsername) {
    return NextResponse.json(
      { error: "No refresh session. Sign in again at /login." },
      { status: 401 },
    );
  }

  try {
    const tokens = await refreshAccessToken({ cognitoUsername, refreshToken });
    const response = NextResponse.json({ ok: true });
    setAuthCookies(response, tokens, cognitoUsername);
    return response;
  } catch (err) {
    console.error("POST /api/auth/refresh", err);
    return NextResponse.json(
      { error: cognitoAuthErrorMessage(err) },
      { status: 401 },
    );
  }
}
