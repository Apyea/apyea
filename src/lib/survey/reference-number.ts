import { prisma } from "@/lib/db";

export async function generateSurveyReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `APYEA-SVY-${year}-`;
  const latest = await prisma.educatorSurvey.findFirst({
    where: { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
    select: { referenceNumber: true },
  });

  let next = 1;
  if (latest?.referenceNumber) {
    const tail = latest.referenceNumber.slice(prefix.length);
    const parsed = Number.parseInt(tail, 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }

  return `${prefix}${String(next).padStart(6, "0")}`;
}
