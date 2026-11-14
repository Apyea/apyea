import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/request-auth";
import { getCognitoUsernameFromRequest } from "@/lib/auth/session";

const FINANCE_WRITE_ROLES: UserRole[] = [
  UserRole.OPERATIONAL_MANAGER,
  UserRole.EXECUTIVE_MANAGER,
  UserRole.ADMIN,
];

const FINANCE_APPROVE_ROLES: UserRole[] = [UserRole.EXECUTIVE_MANAGER, UserRole.ADMIN];

export async function requireFinanceUser(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth;
  }

  const dbUser = await prisma.user.findUnique({
    where: { cognitoSub: auth.payload.sub },
  });

  if (!dbUser || !FINANCE_WRITE_ROLES.includes(dbUser.role)) {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return {
    auth: { payload: auth.payload },
    user: dbUser,
    refreshedTokens: auth.refreshedTokens,
    cognitoUsername: getCognitoUsernameFromRequest(request),
  };
}

export async function requireFinanceApprover(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth;
  }

  const dbUser = await prisma.user.findUnique({
    where: { cognitoSub: auth.payload.sub },
  });

  if (!dbUser || !FINANCE_APPROVE_ROLES.includes(dbUser.role)) {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return {
    auth: { payload: auth.payload },
    user: dbUser,
    refreshedTokens: auth.refreshedTokens,
    cognitoUsername: getCognitoUsernameFromRequest(request),
  };
}

export async function requireAdminUser(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth;
  }

  const dbUser = await prisma.user.findUnique({
    where: { cognitoSub: auth.payload.sub },
  });

  if (!dbUser || dbUser.role !== UserRole.ADMIN) {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return { auth, user: dbUser };
}
