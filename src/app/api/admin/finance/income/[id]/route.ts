import { NextRequest, NextResponse } from "next/server";
import { financeApproverOrResponse, financeJson } from "@/lib/auth/finance-gate";
import { rejectManualIncome, verifyManualIncome } from "@/lib/finance/income";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await financeApproverOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await context.params;
  let body: { action?: string; remarks?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "verify") {
      const record = await verifyManualIncome(id, gate.user.id, body.remarks);
      return financeJson(gate, { record });
    }
    if (body.action === "reject") {
      const record = await rejectManualIncome(id, gate.user.id, body.remarks);
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
