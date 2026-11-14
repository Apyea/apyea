import { prisma } from "@/lib/db";

const DEFAULT_SETTINGS: Record<string, unknown> = {
  membershipApplicationOpen: true,
  renewalSystemEnabled: false,
  renewalEligibilityMode: "individual",
  defaultRenewalFee: 500,
  membershipValidityMonths: 12,
  renewalNoticeDays: 30,
  renewalApprovalRequired: true,
  autoGenerateCard: false,
  autoSendApprovalEmail: false,
  membershipNumberPrefix: "APYEA",
  privacyNoticeVersion: "2026-01",
  defaultMembershipFee: 1000,
};

export async function getAdminSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.adminSetting.findMany();
  const merged = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    merged[row.key] = row.value;
  }
  return merged;
}

export async function getAdminSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.adminSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  return row.value as T;
}

export async function setAdminSetting(key: string, value: unknown) {
  await prisma.adminSetting.upsert({
    where: { key },
    create: { key, value: value as never },
    update: { value: value as never },
  });
}

export async function seedDefaultAdminSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.adminSetting.upsert({
      where: { key },
      create: { key, value: value as never },
      update: {},
    });
  }
}
