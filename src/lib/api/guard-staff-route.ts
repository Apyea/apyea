import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { STAFF_ROLES } from "@/lib/auth/staff-roles";

export async function guardStaff(
  request: NextRequest,
  roles: UserRole[] = STAFF_ROLES,
) {
  const auth = await staffUserOrResponse(request, roles);
  if ("response" in auth) return { response: auth.response } as const;
  return { gate: auth.gate } as const;
}

export function staffOk(
  gate: Awaited<ReturnType<typeof staffUserOrResponse>> extends { gate: infer G }
    ? G extends undefined
      ? never
      : G
    : never,
  body: unknown,
  init?: ResponseInit,
) {
  return staffJson(gate, body, init);
}
