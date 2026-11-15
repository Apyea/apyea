import { NextRequest, NextResponse } from "next/server";
import { financeUserOrResponse } from "@/lib/auth/finance-gate";
import { staffUserOrResponse } from "@/lib/auth/staff-gate";
import { prisma } from "@/lib/db";
import { readPrivateBlob } from "@/lib/uploads/storage-backend";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: Params) {
  const segments = (await params).path;
  const storageKey = segments.join("/");

  const isMembership = storageKey.startsWith("membership/");
  const isFinance = storageKey.startsWith("finance/");
  const isTeam = storageKey.startsWith("team/");

  if (!isMembership && !isFinance && !isTeam) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isFinance) {
    const auth = await financeUserOrResponse(request);
    if ("response" in auth) return auth.response;
  }

  if (isTeam) {
    const linked = await prisma.teamMember.findFirst({
      where: { photoFile: { storageKey } },
      select: { id: true },
    });
    if (!linked) {
      const staff = await staffUserOrResponse(request);
      if ("response" in staff) return staff.response;
    }
  }

  const stored = await prisma.storedFile.findUnique({ where: { storageKey } });
  if (!stored) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await readPrivateBlob({
      storageKey: stored.storageKey,
      blobUrl: stored.blobUrl,
    });
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": stored.mimeType,
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${encodeURIComponent(stored.originalFilename)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}