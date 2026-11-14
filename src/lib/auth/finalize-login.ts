import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { adminGetUser } from "@/lib/cognito/client";
import { decodeAccessTokenPayload } from "@/lib/cognito/jwt";
import { prisma } from "@/lib/db";
import { postLoginRedirectPath } from "@/lib/auth/post-login-redirect";
import { setAuthCookies } from "@/lib/auth/session";
import { syncUserFromCognito } from "@/lib/users/sync-user";

export async function buildLoginSuccessResponse(
  tokens: AuthenticationResultType,
  cognitoUsername: string,
  redirectHint?: string | null,
) {
  const payload = decodeAccessTokenPayload(tokens.AccessToken!);
  const existing = await prisma.user.findUnique({ where: { cognitoSub: payload.sub } });

  let email = existing?.email ?? "";
  let name = existing?.name ?? null;

  try {
    const cognitoUser = await adminGetUser(cognitoUsername);
    email =
      cognitoUser.UserAttributes?.find((a) => a.Name === "email")?.Value?.trim().toLowerCase() ??
      email;
    name =
      cognitoUser.UserAttributes?.find((a) => a.Name === "name")?.Value ?? name;
  } catch (err) {
    console.warn("buildLoginSuccessResponse: adminGetUser failed, using database profile", err);
  }

  if (!email) {
    email = `user-${payload.sub}@apyea.local`;
  }

  const user = await syncUserFromCognito({
    cognitoSub: payload.sub,
    email,
    name,
  });

  const redirect = postLoginRedirectPath(user.role, redirectHint);
  const response = NextResponse.json({
    ok: true,
    redirect,
    user: { id: user.id, role: user.role, email: user.email },
  });
  setAuthCookies(response, tokens, cognitoUsername);
  return response;
}
