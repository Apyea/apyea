import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim() || "";
  const applicationStatus = sp.get("applicationStatus");
  const paymentStatus = sp.get("paymentStatus");
  const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
  const pageSize = Math.min(Math.max(1, Number(sp.get("pageSize") ?? "20") || 20), 100);

  const where: Prisma.MembershipApplicationWhereInput = {
    ...(applicationStatus ? { applicationStatus: applicationStatus as never } : {}),
    ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
    ...(q
      ? {
          OR: [
            { applicationReference: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q } },
            { paymentReference: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.membershipApplication.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          applicationReference: true,
          fullName: true,
          email: true,
          mobile: true,
          applicationStatus: true,
          paymentStatus: true,
          submittedAt: true,
          member: { select: { id: true, membershipNumber: true } },
        },
      }),
      prisma.membershipApplication.count({ where }),
    ]);

    return staffJson(gate, {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/membership/applications", err);
    return staffJson(gate, { error: "Failed to list applications" }, { status: 500 });
  }
}
