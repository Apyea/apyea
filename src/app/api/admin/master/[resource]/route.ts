import { NextRequest, NextResponse } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { MASTER_DATA_ROLES } from "@/lib/auth/staff-roles";
import {
  createMaster,
  isMasterResource,
  listMaster,
} from "@/lib/master-data/registry";

type Params = { params: Promise<{ resource: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request, MASTER_DATA_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { resource } = await params;
  if (!isMasterResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  const parentId =
    request.nextUrl.searchParams.get("stateId") ??
    request.nextUrl.searchParams.get("districtId") ??
    undefined;

  try {
    const items = await listMaster(resource, {
      parentId: parentId ?? undefined,
      includeInactive: true,
    });
    return staffJson(gate, { items });
  } catch (err) {
    console.error(`GET /api/admin/master/${resource}`, err);
    return staffJson(gate, { error: "Failed to list" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request, MASTER_DATA_ROLES);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { resource } = await params;
  if (!isMasterResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const item = await createMaster(resource, body);
    return staffJson(gate, { item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return staffJson(gate, { error: message }, { status: 400 });
  }
}
