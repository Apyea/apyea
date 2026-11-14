import { NextResponse } from "next/server";
import { getPublicEvent } from "@/lib/events/public";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const event = await getPublicEvent(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found or registration closed" }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (err) {
    console.error("GET /api/events/[id]", err);
    return NextResponse.json({ error: "Failed to load event" }, { status: 500 });
  }
}