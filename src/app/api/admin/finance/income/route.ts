import { NextRequest, NextResponse } from "next/server";
import { PaymentCategory, PaymentVerificationStatus } from "@prisma/client";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { createManualIncome, listIncomeRecords } from "@/lib/finance/income";
import { parsePaymentMethod } from "@/lib/finance/labels";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const sp = request.nextUrl.searchParams;
  const category = sp.get("category") as PaymentCategory | null;
  const status = sp.get("status") as PaymentVerificationStatus | null;

  const records = await listIncomeRecords({
    category: category ?? undefined,
    status: status ?? undefined,
    take: 200,
  });

  return financeJson(auth.gate, { records });
}

export async function POST(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const category = String(body.paymentCategory ?? "") as PaymentCategory;
  const method = parsePaymentMethod(String(body.paymentMethod ?? ""));
  const amount = Number(body.amountPaid);

  if (!body.name || !body.mobile || !body.paymentReference || !method || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const record = await createManualIncome(
      {
        name: String(body.name),
        mobile: String(body.mobile),
        address: String(body.address ?? ""),
        paymentDate: new Date(String(body.paymentDate)),
        paymentReference: String(body.paymentReference),
        amountPaid: amount,
        paymentCategory: category,
        paymentMethod: method,
        purposeOfRemittance: body.purposeOfRemittance ? String(body.purposeOfRemittance) : undefined,
        panOfRemitter: body.panOfRemitter ? String(body.panOfRemitter) : undefined,
        memberId: body.memberId ? String(body.memberId) : undefined,
        programId: body.programId ? String(body.programId) : undefined,
        eventId: body.eventId ? String(body.eventId) : undefined,
        subscriptionBasis: body.subscriptionBasis as never,
        subscriptionPlanId: body.subscriptionPlanId
          ? String(body.subscriptionPlanId)
          : undefined,
      },
      gate.user.id,
      true,
    );
    return financeJson(gate, { record }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/finance/income", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record income" },
      { status: 400 },
    );
  }
}
