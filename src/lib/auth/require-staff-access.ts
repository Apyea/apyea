import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/request-auth";
import { getCognitoUsernameFromRequest } from "@/lib/auth/session";
import { STAFF_ROLES } from "@/lib/auth/staff-roles";
import type { CognitoAccessPayload } from "@/lib/cognito/jwt";

export type StaffGateUser = {
  auth: { payload: CognitoAccessPayload };
  user: { id: string; email: string; name: string | null; role: UserRole };
  refreshedTokens: AuthenticationResultType | null;
  cognitoUsername: string | null;
};

export async function requireStaffUser(
  request: NextRequest,
  allowedRoles: UserRole[] = STAFF_ROLES,
) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth;
  }

  const dbUser = await prisma.user.findUnique({
    where: { cognitoSub: auth.payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!dbUser || !allowedRoles.includes(dbUser.role)) {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return {
    auth: { payload: auth.payload },
    user: dbUser,
    refreshedTokens: auth.refreshedTokens,
    cognitoUsername: getCognitoUsernameFromRequest(request),
  } satisfies StaffGateUser;
}
