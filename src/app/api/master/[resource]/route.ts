import { NextRequest, NextResponse } from "next/server";
import { isMasterResource, listMaster } from "@/lib/master-data/registry";

type Params = { params: Promise<{ resource: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!isMasterResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  const parentId =
    request.nextUrl.searchParams.get("stateId") ??
    request.nextUrl.searchParams.get("districtId") ??
    request.nextUrl.searchParams.get("parentId") ??
    undefined;
  const includeInactive =
    request.nextUrl.searchParams.get("includeInactive") === "true";

  try {
    const items = await listMaster(resource, { parentId, includeInactive });
    return NextResponse.json({ items });
  } catch (err) {
    console.error(`GET /api/master/${resource}`, err);
    return NextResponse.json({ error: "Failed to list items" }, { status: 500 });
  }
}
