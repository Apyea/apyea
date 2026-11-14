import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { parsePaymentMethod } from "@/lib/finance/labels";
import { submitRenewalApplication } from "@/lib/membership/renewal-workflow";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const renewals = await prisma.renewalApplication.findMany({
    orderBy: { submittedAt: "desc" },
    take: 100,
    include: {
      member: { select: { membershipNumber: true, fullName: true, email: true } },
    },
  });
  return financeJson(auth.gate, { renewals });
}

export async function POST(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const body = await request.json();
  if (!body.memberId || !body.paymentReference || !body.paymentDate || body.renewalFee === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const method = parsePaymentMethod(String(body.paymentMethod ?? "ONLINE")) ?? "ONLINE";

  try {
    const renewal = await submitRenewalApplication({
      memberId: String(body.memberId),
      paymentReference: String(body.paymentReference),
      paymentDate: new Date(String(body.paymentDate)),
      renewalFee: Number(body.renewalFee),
      paymentMethod: method,
    });
    return financeJson(auth.gate, { renewal }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit renewal" },
      { status: 400 },
    );
  }
}
