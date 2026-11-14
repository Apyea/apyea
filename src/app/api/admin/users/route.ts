import { NextRequest, NextResponse } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { ADMIN_ONLY_ROLES } from "@/lib/auth/staff-roles";
import { adminCreateUser, listUsers } from "@/lib/cognito/client";
import { syncUserFromCognito } from "@/lib/users/sync-user";

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request, ADMIN_ONLY_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");
  const token = request.nextUrl.searchParams.get("token") ?? undefined;

  try {
    const result = await listUsers(
      Number.isFinite(limit) ? limit : 20,
      token,
    );
    return staffJson(gate, {
      users: result.Users ?? [],
      paginationToken: result.PaginationToken,
    });
  } catch (err) {
    console.error("GET /api/admin/users", err);
    return staffJson(
      gate,
      { error: "Failed to list Cognito users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await staffUserOrResponse(request, ADMIN_ONLY_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  let body: { email?: string; name?: string; temporaryPassword?: string };
  try {
    body = await request.json();
  } catch {
    return staffJson(gate, { error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.email?.trim()) {
    return staffJson(gate, { error: "email is required" }, { status: 400 });
  }

  try {
    const created = await adminCreateUser({
      email: body.email.trim(),
      name: body.name?.trim(),
      temporaryPassword: body.temporaryPassword,
    });

    const sub =
      created.User?.Attributes?.find((a) => a.Name === "sub")?.Value ?? null;

    if (sub) {
      await syncUserFromCognito({
        cognitoSub: sub,
        email: body.email.trim(),
        name: body.name?.trim() ?? null,
      });
    }

    return staffJson(gate, { user: created.User }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/users", err);
    return staffJson(
      gate,
      { error: "Failed to create user in Cognito" },
      { status: 500 },
    );
  }
}
