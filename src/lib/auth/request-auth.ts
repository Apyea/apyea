import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest } from "next/server";
import { refreshAccessToken } from "@/lib/cognito/user-auth";
import type { CognitoAccessPayload } from "@/lib/cognito/jwt";
import { verifyAccessToken } from "@/lib/cognito/jwt";
import {
  getAccessTokenFromRequest,
  getCognitoUsernameFromRequest,
  getRefreshTokenFromRequest,
} from "@/lib/auth/session";

export async function getBearerToken(request: NextRequest): Promise<string | null> {
  return getAccessTokenFromRequest(request);
}

export type AuthSuccess = {
  payload: CognitoAccessPayload;
  refreshedTokens: AuthenticationResultType | null;
};

export async function requireAuth(
  request: NextRequest,
): Promise<AuthSuccess | { error: string; status: number }> {
  const token = getAccessTokenFromRequest(request);
  if (token) {
    try {
      const payload = await verifyAccessToken(token);
      return { payload, refreshedTokens: null };
    } catch {
      // Access token expired — attempt refresh below
    }
  }

  const refreshToken = getRefreshTokenFromRequest(request);
  const cognitoUsername = getCognitoUsernameFromRequest(request);
  if (refreshToken && cognitoUsername) {
    try {
      const tokens = await refreshAccessToken({ cognitoUsername, refreshToken });
      const payload = await verifyAccessToken(tokens.AccessToken!);
      return { payload, refreshedTokens: tokens };
    } catch {
      // Refresh failed
    }
  }

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }
  return { error: "Invalid or expired token", status: 401 };
}
