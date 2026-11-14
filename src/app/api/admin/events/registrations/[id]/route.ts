import { NextRequest } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { getEventRegistrationAdmin } from "@/lib/events/admin";
import {
  cancelEventRegistration,
  rejectEventRegistration,
  verifyEventRegistrationPayment,
} from "@/lib/events/workflow";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const registration = await getEventRegistrationAdmin(id);
  if (!registration) {
    return staffJson(auth.gate, { error: "Not found" }, { status: 404 });
  }
  return staffJson(auth.gate, { registration });
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;
  const { id } = await params;

  let body: { action?: string; remarks?: string };
  try {
    body = await request.json();
  } catch {
    return staffJson(gate, { error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action?.trim();
  const remarks = body.remarks?.trim();

  try {
    if (action === "verify_payment") {
      await verifyEventRegistrationPayment(id, auth.gate.user.id, remarks);
    } else if (action === "reject") {
      if (!remarks) {
        return staffJson(gate, { error: "Remarks required to reject" }, { status: 400 });
      }
      await rejectEventRegistration(id, remarks, auth.gate.user.id);
    } else if (action === "cancel") {
      await cancelEventRegistration(id, auth.gate.user.id);
    } else {
      return staffJson(gate, { error: "Unknown action" }, { status: 400 });
    }

    const registration = await getEventRegistrationAdmin(id);
    return staffJson(gate, { registration });
  } catch (err) {
    console.error("POST /api/admin/events/registrations/[id]", err);
    return staffJson(
      gate,
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 400 },
    );
  }
}