import { NextRequest } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { createTeamMember, listTeamMembersAdmin } from "@/lib/team/admin";
import { parseTeamMemberDesignation } from "@/lib/team/options";

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const sp = request.nextUrl.searchParams;
  const members = await listTeamMembersAdmin({ q: sp.get("q") ?? undefined });
  return staffJson(auth.gate, { members });
}

export async function POST(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return staffJson(gate, { error: "Use multipart form data" }, { status: 400 });
  }

  const form = await request.formData();
  const photo = form.get("photo");
  const fullName = String(form.get("fullName") ?? "").trim();
  const designation = parseTeamMemberDesignation(String(form.get("designation") ?? ""));
  if (!fullName || !designation) {
    return staffJson(gate, { error: "fullName and designation are required" }, { status: 400 });
  }

  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;

  try {
    const member = await createTeamMember(
      {
        fullName,
        designation,
        qualification: String(form.get("qualification") ?? ""),
        displayOrder: Number(form.get("displayOrder") ?? "0") || 0,
      },
      photoFile,
    );
    return staffJson(gate, { member }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/team/members", err);
    return staffJson(
      gate,
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 400 },
    );
  }
}