import { NextRequest, NextResponse } from "next/server";
import { ExpenseCategory, ExpenseVoucherStatus } from "@prisma/client";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { createExpenseVoucher, listExpenseVouchers } from "@/lib/finance/expense";
import { parsePaymentMethod } from "@/lib/finance/labels";
import { storeUploadedFile, validateExpenseBillFile } from "@/lib/uploads/store-file";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const sp = request.nextUrl.searchParams;
  const category = sp.get("category") as ExpenseCategory | null;
  const status = sp.get("status") as ExpenseVoucherStatus | null;

  const vouchers = await listExpenseVouchers({
    category: category ?? undefined,
    status: status ?? undefined,
    take: 200,
  });

  return financeJson(auth.gate, { vouchers });
}

type ExpenseFields = {
  expenseCategory: ExpenseCategory;
  expenseDate: string;
  description: string;
  amount: number;
  paymentMethod: string;
  paidTo: string;
  transactionRef?: string;
  supportingBillNo?: string;
  programId?: string;
  remarks?: string;
};

async function parseExpenseCreateRequest(request: NextRequest): Promise<
  | { ok: true; fields: ExpenseFields; bill: File | null }
  | { ok: false; error: string; status: number }
> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const billField = form.get("bill");
    const bill =
      billField instanceof File && billField.size > 0 ? billField : null;

    const amount = Number(form.get("amount"));
    const fields: ExpenseFields = {
      expenseCategory: String(form.get("expenseCategory") ?? "") as ExpenseCategory,
      expenseDate: String(form.get("expenseDate") ?? ""),
      description: String(form.get("description") ?? ""),
      amount,
      paymentMethod: String(form.get("paymentMethod") ?? ""),
      paidTo: String(form.get("paidTo") ?? ""),
      transactionRef: form.get("transactionRef")
        ? String(form.get("transactionRef"))
        : undefined,
      supportingBillNo: form.get("supportingBillNo")
        ? String(form.get("supportingBillNo"))
        : undefined,
      programId: form.get("programId") ? String(form.get("programId")) : undefined,
      remarks: form.get("remarks") ? String(form.get("remarks")) : undefined,
    };

    return { ok: true, fields, bill };
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return { ok: false, error: "Invalid JSON", status: 400 };
  }

  const fields: ExpenseFields = {
    expenseCategory: body.expenseCategory as ExpenseCategory,
    expenseDate: String(body.expenseDate ?? ""),
    description: String(body.description ?? ""),
    amount: Number(body.amount),
    paymentMethod: String(body.paymentMethod ?? ""),
    paidTo: String(body.paidTo ?? ""),
    transactionRef: body.transactionRef ? String(body.transactionRef) : undefined,
    supportingBillNo: body.supportingBillNo ? String(body.supportingBillNo) : undefined,
    programId: body.programId ? String(body.programId) : undefined,
    remarks: body.remarks ? String(body.remarks) : undefined,
  };

  return { ok: true, fields, bill: null };
}

export async function POST(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const parsed = await parseExpenseCreateRequest(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { fields, bill } = parsed;
  const method = parsePaymentMethod(fields.paymentMethod);

  if (!fields.description || !fields.paidTo || !method || !Number.isFinite(fields.amount)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let supportingBillFileId: string | undefined;
  if (bill) {
    const billError = validateExpenseBillFile(bill);
    if (billError) {
      return financeJson(gate, { error: billError }, { status: 400 });
    }
    try {
      const stored = await storeUploadedFile(bill, "finance/expenses");
      supportingBillFileId = stored.id;
    } catch (err) {
      console.error("POST /api/admin/finance/expenses upload", err);
      return financeJson(
        gate,
        { error: "Failed to store bill or receipt" },
        { status: 500 },
      );
    }
  }

  try {
    const voucher = await createExpenseVoucher(
      {
        expenseCategory: fields.expenseCategory,
        expenseDate: new Date(fields.expenseDate),
        description: fields.description,
        amount: fields.amount,
        paymentMethod: method,
        paidTo: fields.paidTo,
        transactionRef: fields.transactionRef,
        supportingBillNo: fields.supportingBillNo,
        supportingBillFileId,
        programId: fields.programId,
        remarks: fields.remarks,
      },
      gate.user.id,
    );
    return financeJson(gate, { voucher }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/finance/expenses", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create voucher" },
      { status: 400 },
    );
  }
}
