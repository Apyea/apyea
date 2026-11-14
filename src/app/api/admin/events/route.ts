import { NextRequest } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { listEventsForStaff } from "@/lib/events/admin";
import { decimalToNumber } from "@/lib/events/workflow";

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  try {
    const events = await listEventsForStaff();
    return staffJson(auth.gate, {
      events: events.map((e) => ({
        ...e,
        defaultFee: decimalToNumber(e.defaultFee),
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/events", err);
    return staffJson(
      auth.gate,
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load events. Run `npx prisma migrate deploy` if the database is behind.",
      },
      { status: 500 },
    );
  }
}