import { prisma } from "@/lib/db";

export async function generateEventRegistrationReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `APYEA-EVT-REG-${year}-`;
  const latest = await prisma.eventRegistration.findFirst({
    where: { registrationReference: { startsWith: prefix } },
    orderBy: { registrationReference: "desc" },
    select: { registrationReference: true },
  });
  let next = 1;
  if (latest?.registrationReference) {
    const parsed = Number.parseInt(latest.registrationReference.slice(prefix.length), 10);
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  return `${prefix}${String(next).padStart(5, "0")}`;
}