import { NextRequest, NextResponse } from "next/server";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import {
  approveRenewalApplication,
  verifyRenewalPayment,
} from "@/lib/membership/renewal-workflow";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await context.params;
  const body = await request.json();
  const action = String(body.action ?? "");
  const remarks = body.remarks ? String(body.remarks) : undefined;

  try {
    if (action === "verify_payment") {
      await verifyRenewalPayment(id, gate.user.id, remarks);
      return financeJson(gate, { ok: true });
    }
    if (action === "approve") {
      await approveRenewalApplication(id, gate.user.id);
      return financeJson(gate, { ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 400 },
    );
  }
}
