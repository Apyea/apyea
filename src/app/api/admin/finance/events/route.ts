import { NextRequest, NextResponse } from "next/server";
import { financeJson, financeUserOrResponse } from "@/lib/auth/finance-gate";
import { createEvent, listEvents } from "@/lib/finance/catalog";

export async function GET(request: NextRequest) {
  const auth = await financeUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const events = await listEvents(request.nextUrl.searchParams.get("active") === "1");
  return financeJson(auth.gate, { events });
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
    const event = await createEvent({
      code: String(body.code),
      title: String(body.title),
      description: body.description ? String(body.description) : undefined,
      programId: body.programId ? String(body.programId) : undefined,
      eventDate: body.eventDate ? new Date(String(body.eventDate)) : undefined,
      venue: body.venue ? String(body.venue) : undefined,
      defaultFee: body.defaultFee !== undefined ? Number(body.defaultFee) : undefined,
      memberFee: body.memberFee !== undefined ? Number(body.memberFee) : undefined,
      nonMemberFee: body.nonMemberFee !== undefined ? Number(body.nonMemberFee) : undefined,
      registrationOpen: body.registrationOpen === true,
      registrationClosesAt: body.registrationClosesAt
        ? new Date(String(body.registrationClosesAt))
        : undefined,
      isActive: body.isActive !== false,
    });
    return financeJson(auth.gate, { event }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create event" },
      { status: 400 },
    );
  }
}
