import { NextRequest, NextResponse } from "next/server";
import { ExpenseCategory } from "@prisma/client";
import {
  financeApproverOrResponse,
  financeJson,
  financeUserOrResponse,
} from "@/lib/auth/finance-gate";
import {
  approveExpenseVoucher,
  rejectExpenseVoucher,
  updateExpenseVoucher,
} from "@/lib/finance/expense";
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

  const action = String(body.action ?? "update");

  if (action === "approve" || action === "reject") {
    const auth = await financeApproverOrResponse(request);
    if ("response" in auth) return auth.response;
    const gate = auth.gate;
    try {
      const voucher =
        action === "approve"
          ? await approveExpenseVoucher(id, gate.user.id)
          : await rejectExpenseVoucher(id, gate.user.id, body.remarks ? String(body.remarks) : undefined);
      return financeJson(gate, { voucher });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Action failed" },
        { status: 400 },
      );
    }
  }

  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const method = body.paymentMethod ? parsePaymentMethod(String(body.paymentMethod)) : undefined;

  try {
    const voucher = await updateExpenseVoucher(
      id,
      {
        ...(body.expenseCategory ? { expenseCategory: body.expenseCategory as ExpenseCategory } : {}),
        ...(body.expenseDate ? { expenseDate: new Date(String(body.expenseDate)) } : {}),
        ...(body.description !== undefined ? { description: String(body.description) } : {}),
        ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
        ...(method ? { paymentMethod: method } : {}),
        ...(body.paidTo !== undefined ? { paidTo: String(body.paidTo) } : {}),
        ...(body.programId !== undefined
          ? { programId: body.programId ? String(body.programId) : undefined }
          : {}),
        remarks: body.remarks !== undefined ? String(body.remarks) : undefined,
      },
      gate.user.id,
    );
    return financeJson(gate, { voucher });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
