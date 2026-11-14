import { NextResponse } from "next/server";
import { listPublicTeamMembers, toPublicTeamMember } from "@/lib/team/public";

export async function GET() {
  try {
    const members = await listPublicTeamMembers();
    return NextResponse.json({
      members: members.map(toPublicTeamMember),
    });
  } catch (err) {
    console.error("GET /api/team", err);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}