import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true, basis: "MEMBERSHIP" },
    orderBy: { title: "asc" },
    select: {
      id: true,
      code: true,
      title: true,
      fee: true,
      durationMonths: true,
    },
  });

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      durationMonths: p.durationMonths,
      fee: Number(p.fee),
    })),
  });
}