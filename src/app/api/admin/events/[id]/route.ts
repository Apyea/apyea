import { NextRequest } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { updateEvent } from "@/lib/finance/catalog";
import { prisma } from "@/lib/db";
import { decimalToNumber } from "@/lib/events/workflow";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) return staffJson(auth.gate, { error: "Not found" }, { status: 404 });
  return staffJson(auth.gate, {
    event: { ...event, defaultFee: decimalToNumber(event.defaultFee) },
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return staffJson(auth.gate, { error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const event = await updateEvent(id, {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined
        ? { description: body.description ? String(body.description) : null }
        : {}),
      ...(body.venue !== undefined ? { venue: body.venue ? String(body.venue) : null } : {}),
      ...(body.eventDate !== undefined
        ? { eventDate: body.eventDate ? new Date(String(body.eventDate)) : null }
        : {}),
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
    return staffJson(auth.gate, {
      event: { ...event, defaultFee: decimalToNumber(event.defaultFee) },
    });
  } catch (err) {
    return staffJson(
      auth.gate,
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}