import { NextRequest, NextResponse } from "next/server";
import { PaymentCategory } from "@prisma/client";
import {
  financeApproverOrResponse,
  financeJson,
  financeUserOrResponse,
} from "@/lib/auth/finance-gate";
import {
  rejectManualIncome,
  updateManualIncome,
  verifyManualIncome,
} from "@/lib/finance/income";
import { parsePaymentMethod } from "@/lib/finance/labels";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "");

  try {
    if (action === "update") {
      const authUpdate = await financeUserOrResponse(request);
      if ("response" in authUpdate) return authUpdate.response;
      const method = body.paymentMethod
        ? parsePaymentMethod(String(body.paymentMethod))
        : undefined;
      const record = await updateManualIncome(
        id,
        {
          ...(body.name !== undefined ? { name: String(body.name) } : {}),
          ...(body.mobile !== undefined ? { mobile: String(body.mobile) } : {}),
          ...(body.address !== undefined ? { address: String(body.address) } : {}),
          ...(body.paymentDate ? { paymentDate: new Date(String(body.paymentDate)) } : {}),
          ...(body.needByDate !== undefined
            ? {
                needByDate: body.needByDate ? new Date(String(body.needByDate)) : undefined,
              }
            : {}),
          ...(body.paymentReference !== undefined
            ? { paymentReference: String(body.paymentReference) }
            : {}),
          ...(body.amountPaid !== undefined ? { amountPaid: Number(body.amountPaid) } : {}),
          ...(method ? { paymentMethod: method } : {}),
          ...(body.paymentCategory
            ? { paymentCategory: String(body.paymentCategory) as PaymentCategory }
            : {}),
          ...(body.purposeOfRemittance !== undefined
            ? { purposeOfRemittance: String(body.purposeOfRemittance) }
            : {}),
          ...(body.programId !== undefined
            ? { programId: body.programId ? String(body.programId) : undefined }
            : {}),
          ...(body.eventId !== undefined
            ? { eventId: body.eventId ? String(body.eventId) : undefined }
            : {}),
        },
        authUpdate.gate.user.id,
      );
      return financeJson(authUpdate.gate, { record });
    }

    const auth = await financeApproverOrResponse(request);
    if ("response" in auth) return auth.response;
    const gate = auth.gate;

    if (action === "verify") {
      const record = await verifyManualIncome(
        id,
        gate.user.id,
        body.remarks ? String(body.remarks) : undefined,
      );
      return financeJson(gate, { record });
    }
    if (action === "reject") {
      const record = await rejectManualIncome(
        id,
        gate.user.id,
        body.remarks ? String(body.remarks) : undefined,
      );
      return financeJson(gate, { record });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/admin/finance/income/[id]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}