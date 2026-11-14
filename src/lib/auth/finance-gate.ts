import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import type { User } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireFinanceApprover, requireFinanceUser } from "@/lib/auth/require-finance-access";
import type { CognitoAccessPayload } from "@/lib/cognito/jwt";
import { setAuthCookies } from "@/lib/auth/session";

export type FinanceGate = {
  auth: { payload: CognitoAccessPayload };
  user: User;
  refreshedTokens: AuthenticationResultType | null;
  cognitoUsername: string | null;
};

export function financeJson(
  gate: FinanceGate,
  body: unknown,
  init?: ResponseInit,
): NextResponse {
  const res = NextResponse.json(body, init);
  if (gate.refreshedTokens) {
    setAuthCookies(res, gate.refreshedTokens, gate.cognitoUsername ?? undefined);
  }
  return res;
}

export async function financeUserOrResponse(
  request: Request,
): Promise<{ response: NextResponse } | { gate: FinanceGate }> {
  const gate = await requireFinanceUser(request as never);
  if (!("user" in gate) || !gate.user) {
    return {
      response: NextResponse.json(
        {
          error: "error" in gate ? gate.error : "Forbidden",
          hint:
            "status" in gate && gate.status === 401
              ? "Sign in at /login (finance APIs require a staff session). If you just signed in, try again — older sessions may need a fresh login."
              : "Finance access requires ADMIN, OPERATIONAL_MANAGER, or EXECUTIVE_MANAGER on your user record.",
        },
        { status: "status" in gate ? gate.status : 403 },
      ),
    };
  }
  return {
    gate: {
      auth: gate.auth,
      user: gate.user,
      refreshedTokens: gate.refreshedTokens,
      cognitoUsername: gate.cognitoUsername,
    },
  };
}

export async function financeApproverOrResponse(
  request: Request,
): Promise<{ response: NextResponse } | { gate: FinanceGate }> {
  const gate = await requireFinanceApprover(request as never);
  if (!("user" in gate) || !gate.user) {
    return {
      response: NextResponse.json(
        {
          error: "error" in gate ? gate.error : "Forbidden",
          hint:
            "status" in gate && gate.status === 401
              ? "Sign in at /login (finance APIs require a staff session). If you just signed in, try again — older sessions may need a fresh login."
              : "Finance access requires ADMIN, OPERATIONAL_MANAGER, or EXECUTIVE_MANAGER on your user record.",
        },
        { status: "status" in gate ? gate.status : 403 },
      ),
    };
  }
  return {
    gate: {
      auth: gate.auth,
      user: gate.user,
      refreshedTokens: gate.refreshedTokens,
      cognitoUsername: gate.cognitoUsername,
    },
  };
}
