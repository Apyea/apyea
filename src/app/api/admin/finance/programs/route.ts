import { NextRequest, NextResponse } from "next/server";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { createProgram, listPrograms } from "@/lib/finance/catalog";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const activeOnly = request.nextUrl.searchParams.get("active") === "1";
  const programs = await listPrograms(activeOnly);
  return financeJson(auth.gate, { programs });
}

export async function POST(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.code || !body.title) {
    return NextResponse.json({ error: "code and title are required" }, { status: 400 });
  }

  try {
    const program = await createProgram({
      code: String(body.code),
      title: String(body.title),
      description: body.description ? String(body.description) : undefined,
      defaultFee: body.defaultFee !== undefined ? Number(body.defaultFee) : undefined,
      startDate: body.startDate ? new Date(String(body.startDate)) : undefined,
      endDate: body.endDate ? new Date(String(body.endDate)) : undefined,
      isActive: body.isActive !== false,
    });
    return financeJson(auth.gate, { program }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create program" },
      { status: 400 },
    );
  }
}
