import { NextRequest, NextResponse } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { ADMIN_ONLY_ROLES } from "@/lib/auth/staff-roles";
import { adminDeleteUser, adminUpdateUserAttributes } from "@/lib/cognito/client";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ username: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await staffUserOrResponse(request, ADMIN_ONLY_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { username } = await context.params;
  const decodedUsername = decodeURIComponent(username);

  let body: { name?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return staffJson(gate, { error: "Invalid JSON body" }, { status: 400 });
  }

  const attributes = [];
  if (body.name !== undefined) {
    attributes.push({ Name: "name", Value: body.name });
  }
  if (body.email !== undefined) {
    attributes.push({ Name: "email", Value: body.email });
  }

  if (attributes.length === 0) {
    return staffJson(
      gate,
      { error: "Provide name and/or email to update" },
      { status: 400 },
    );
  }

  try {
    await adminUpdateUserAttributes(decodedUsername, attributes);

    if (body.email) {
      await prisma.user.updateMany({
        where: { email: decodedUsername },
        data: {
          email: body.email,
          ...(body.name !== undefined ? { name: body.name } : {}),
        },
      });
    }

    return staffJson(gate, { ok: true });
  } catch (err) {
    console.error("PATCH /api/admin/users/[username]", err);
    return staffJson(
      gate,
      { error: "Failed to update Cognito user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await staffUserOrResponse(request, ADMIN_ONLY_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { username } = await context.params;
  const decodedUsername = decodeURIComponent(username);

  try {
    await adminDeleteUser(decodedUsername);
    await prisma.user.deleteMany({ where: { email: decodedUsername } });
    return staffJson(gate, { ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/users/[username]", err);
    return staffJson(
      gate,
      { error: "Failed to delete Cognito user" },
      { status: 500 },
    );
  }
}
