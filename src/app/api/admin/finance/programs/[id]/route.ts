import { NextRequest, NextResponse } from "next/server";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { updateProgram } from "@/lib/finance/catalog";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const program = await updateProgram(id, {
      ...(body.code !== undefined ? { code: String(body.code) } : {}),
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined
        ? { description: body.description ? String(body.description) : null }
        : {}),
      ...(body.defaultFee !== undefined
        ? { defaultFee: body.defaultFee === null ? null : Number(body.defaultFee) }
        : {}),
      ...(body.startDate !== undefined
        ? { startDate: body.startDate ? new Date(String(body.startDate)) : null }
        : {}),
      ...(body.endDate !== undefined
        ? { endDate: body.endDate ? new Date(String(body.endDate)) : null }
        : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    });
    return financeJson(auth.gate, { program });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
