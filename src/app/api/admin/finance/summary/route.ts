import { NextRequest, NextResponse } from "next/server";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { getFinanceSummary, parseFinanceDateRange } from "@/lib/finance/summary";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const { from, to } = parseFinanceDateRange(request.nextUrl.searchParams);

  try {
    const summary = await getFinanceSummary(from, to);
    return financeJson(auth.gate, summary);
  } catch (err) {
    console.error("GET /api/admin/finance/summary", err);
    return NextResponse.json({ error: "Failed to load summary" }, { status: 500 });
  }
}
