import { NextResponse } from "next/server";
import { listPublicEvents } from "@/lib/events/public";

export async function GET() {
  try {
    const events = await listPublicEvents();
    return NextResponse.json({ events });
  } catch (err) {
    console.error("GET /api/events", err);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}