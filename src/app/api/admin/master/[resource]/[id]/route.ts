import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { MASTER_DATA_ROLES } from "@/lib/auth/staff-roles";
import { deleteMaster, isMasterResource, updateMaster } from "@/lib/master-data/registry";

type Params = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request, MASTER_DATA_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { resource, id } = await params;
  if (!isMasterResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const item = await updateMaster(resource, id, body);
    return staffJson(gate, { item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return staffJson(gate, { error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request, MASTER_DATA_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { resource, id } = await params;
  if (!isMasterResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  try {
    const item = await deleteMaster(resource, id);
    return staffJson(gate, { item });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return staffJson(
          gate,
          {
            error:
              "Cannot delete: surveys, membership applications, or other data still reference this record.",
          },
          { status: 409 },
        );
      }
      if (err.code === "P2025") {
        return staffJson(gate, { error: "Record not found" }, { status: 404 });
      }
    }
    const message = err instanceof Error ? err.message : "Delete failed";
    return staffJson(gate, { error: message }, { status: 400 });
  }
}
