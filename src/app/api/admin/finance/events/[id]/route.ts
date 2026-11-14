import { NextRequest, NextResponse } from "next/server";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { updateEvent } from "@/lib/finance/catalog";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = await request.json();

  try {
    const event = await updateEvent(id, {
      ...(body.code !== undefined ? { code: String(body.code) } : {}),
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.programId !== undefined
        ? { programId: body.programId ? String(body.programId) : null }
        : {}),
      ...(body.eventDate !== undefined
        ? { eventDate: body.eventDate ? new Date(String(body.eventDate)) : null }
        : {}),
      ...(body.description !== undefined
        ? { description: body.description ? String(body.description) : null }
        : {}),
      ...(body.venue !== undefined ? { venue: body.venue ? String(body.venue) : null } : {}),
      ...(body.defaultFee !== undefined
        ? { defaultFee: body.defaultFee === null ? null : Number(body.defaultFee) }
        : {}),
      ...(body.registrationOpen !== undefined
        ? { registrationOpen: Boolean(body.registrationOpen) }
        : {}),
      ...(body.registrationClosesAt !== undefined
        ? {
            registrationClosesAt: body.registrationClosesAt
              ? new Date(String(body.registrationClosesAt))
              : null,
          }
        : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    });
    return financeJson(auth.gate, { event });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
