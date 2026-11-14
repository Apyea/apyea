import { NextRequest, NextResponse } from "next/server";
import { SubscriptionBasis } from "@prisma/client";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { updateSubscriptionPlan } from "@/lib/finance/catalog";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = await request.json();

  try {
    const plan = await updateSubscriptionPlan(id, {
      ...(body.code !== undefined ? { code: String(body.code) } : {}),
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.basis !== undefined ? { basis: body.basis as SubscriptionBasis } : {}),
      ...(body.programId !== undefined
        ? { programId: body.programId ? String(body.programId) : null }
        : {}),
      ...(body.eventId !== undefined ? { eventId: body.eventId ? String(body.eventId) : null } : {}),
      ...(body.durationMonths !== undefined ? { durationMonths: Number(body.durationMonths) } : {}),
      ...(body.fee !== undefined ? { fee: Number(body.fee) } : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    });
    return financeJson(auth.gate, { plan });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
