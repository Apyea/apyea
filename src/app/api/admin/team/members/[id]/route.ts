import { NextRequest } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { deleteTeamMember, getTeamMemberAdmin, updateTeamMember } from "@/lib/team/admin";
import { parseTeamMemberDesignation } from "@/lib/team/options";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const member = await getTeamMemberAdmin(id);
  if (!member) return staffJson(auth.gate, { error: "Not found" }, { status: 404 });
  return staffJson(auth.gate, { member });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;
  const { id } = await params;

  const existing = await getTeamMemberAdmin(id);
  if (!existing) return staffJson(gate, { error: "Not found" }, { status: 404 });

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return staffJson(gate, { error: "Use multipart form data" }, { status: 400 });
  }

  const form = await request.formData();
  const photo = form.get("photo");
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
  const removePhoto = form.get("removePhoto") === "true";

  const designationRaw = form.has("designation") ? String(form.get("designation")) : null;
  const designation = designationRaw ? parseTeamMemberDesignation(designationRaw) : undefined;
  if (designationRaw && !designation) {
    return staffJson(gate, { error: "Invalid designation" }, { status: 400 });
  }

  try {
    const member = await updateTeamMember(
      id,
      {
        ...(form.has("fullName") ? { fullName: String(form.get("fullName")) } : {}),
        ...(designation ? { designation } : {}),
        ...(form.has("qualification") ? { qualification: String(form.get("qualification")) } : {}),
        ...(form.has("displayOrder")
          ? { displayOrder: Number(form.get("displayOrder") ?? "0") || 0 }
          : {}),
      },
      photoFile,
      removePhoto,
    );
    return staffJson(gate, { member });
  } catch (err) {
    console.error("PATCH /api/admin/team/members/[id]", err);
    return staffJson(
      gate,
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  try {
    await deleteTeamMember(id);
    return staffJson(auth.gate, { ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/team/members/[id]", err);
    return staffJson(auth.gate, { error: "Delete failed" }, { status: 400 });
  }
}