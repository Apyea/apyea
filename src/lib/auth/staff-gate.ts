import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { requireStaffUser, type StaffGateUser } from "@/lib/auth/require-staff-access";
import { setAuthCookies } from "@/lib/auth/session";
import { STAFF_ROLES } from "@/lib/auth/staff-roles";

export function staffJson(
  gate: StaffGateUser,
  body: unknown,
  init?: ResponseInit,
): NextResponse {
  const res = NextResponse.json(body, init);
  if (gate.refreshedTokens) {
    setAuthCookies(res, gate.refreshedTokens, gate.cognitoUsername ?? undefined);
  }
  return res;
}

export async function staffUserOrResponse(
  request: Request,
  allowedRoles: UserRole[] = STAFF_ROLES,
): Promise<{ response: NextResponse } | { gate: StaffGateUser }> {
  const gate = await requireStaffUser(request as never, allowedRoles);
  if (!("user" in gate) || !gate.user) {
    return {
      response: NextResponse.json(
        {
          error: "error" in gate ? gate.error : "Forbidden",
          hint:
            "status" in gate && gate.status === 401
              ? "Sign in at /login with a staff account."
              : "This action requires an authorized staff role.",
        },
        { status: "status" in gate ? gate.status : 403 },
      ),
    };
  }
  return { gate };
}
