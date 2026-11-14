import type { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";

export const ACCESS_COOKIE = "apyea_access_token";
export const REFRESH_COOKIE = "apyea_refresh_token";
/** Cognito username used for REFRESH_TOKEN_AUTH (with client secret). */
export const USERNAME_COOKIE = "apyea_cognito_username";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthenticationResultType,
  cognitoUsername?: string,
) {
  if (tokens.AccessToken) {
    response.cookies.set(ACCESS_COOKIE, tokens.AccessToken, {
      ...cookieBase,
      maxAge: tokens.ExpiresIn ?? 3600,
    });
  }
  if (tokens.RefreshToken) {
    response.cookies.set(REFRESH_COOKIE, tokens.RefreshToken, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (cognitoUsername) {
    response.cookies.set(USERNAME_COOKIE, cognitoUsername, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieBase, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieBase, maxAge: 0 });
  response.cookies.set(USERNAME_COOKIE, "", { ...cookieBase, maxAge: 0 });
}

export function getRefreshTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_COOKIE)?.value ?? null;
}

export function getCognitoUsernameFromRequest(request: NextRequest): string | null {
  return request.cookies.get(USERNAME_COOKIE)?.value ?? null;
}

export function getAccessTokenFromRequest(request: NextRequest): string | null {
  const fromCookie = request.cookies.get(ACCESS_COOKIE)?.value;
  if (fromCookie) return fromCookie;

  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim() || null;
  }
  return null;
}
