import { NextRequest, NextResponse } from "next/server";
import { SubscriptionBasis } from "@prisma/client";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { createSubscriptionPlan, listSubscriptionPlans } from "@/lib/finance/catalog";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const plans = await listSubscriptionPlans(request.nextUrl.searchParams.get("active") === "1");
  return financeJson(auth.gate, { plans });
}

export async function POST(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const body = await request.json();
  if (!body.code || !body.title || !body.basis || body.fee === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const plan = await createSubscriptionPlan({
      code: String(body.code),
      title: String(body.title),
      basis: body.basis as SubscriptionBasis,
      programId: body.programId ? String(body.programId) : undefined,
      eventId: body.eventId ? String(body.eventId) : undefined,
      durationMonths: body.durationMonths ? Number(body.durationMonths) : undefined,
      fee: Number(body.fee),
      isActive: body.isActive !== false,
    });
    return financeJson(auth.gate, { plan }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create plan" },
      { status: 400 },
    );
  }
}
