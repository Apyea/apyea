import { EventRegistrationStatus, MembershipPaymentStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { listEventRegistrationsAdmin } from "@/lib/events/admin";

function parseRegistrationStatus(raw: string | null) {
  if (!raw) return undefined;
  const v = raw.trim().toUpperCase();
  return (Object.values(EventRegistrationStatus) as string[]).includes(v)
    ? (v as EventRegistrationStatus)
    : undefined;
}

function parsePaymentStatus(raw: string | null) {
  if (!raw) return undefined;
  const v = raw.trim().toUpperCase();
  return (Object.values(MembershipPaymentStatus) as string[]).includes(v)
    ? (v as MembershipPaymentStatus)
    : undefined;
}

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const sp = request.nextUrl.searchParams;
  try {
    const registrations = await listEventRegistrationsAdmin({
      q: sp.get("q") ?? undefined,
      eventId: sp.get("eventId") ?? undefined,
      registrationStatus: parseRegistrationStatus(sp.get("registrationStatus")),
      paymentStatus: parsePaymentStatus(sp.get("paymentStatus")),
    });
    return staffJson(auth.gate, { registrations });
  } catch (err) {
    console.error("GET /api/admin/events/registrations", err);
    return staffJson(
      auth.gate,
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load registrations. Run `npx prisma migrate deploy` if the database is behind.",
      },
      { status: 500 },
    );
  }
}