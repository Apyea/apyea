import { PrismaClient } from "@prisma/client";
import { seedDefaultAdminSettings } from "../src/lib/membership/settings";

const prisma = new PrismaClient();

async function seedLookups() {
  const genders = [
    { code: "MALE", label: "Male", sortOrder: 1 },
    { code: "FEMALE", label: "Female", sortOrder: 2 },
    { code: "OTHER", label: "Other", sortOrder: 3 },
    { code: "PREFER_NOT_SAY", label: "Prefer not to say", sortOrder: 4 },
  ];
  for (const row of genders) {
    await prisma.gender.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const nationalities = [
    { code: "IN", label: "Indian", sortOrder: 1 },
    { code: "OTHER", label: "Other", sortOrder: 2 },
  ];
  for (const row of nationalities) {
    await prisma.nationality.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const yogaLevels = [
    { code: "CERTIFICATE", label: "Certificate Course in Yoga", sortOrder: 1 },
    { code: "DIPLOMA", label: "Diploma in Yoga", sortOrder: 2 },
    { code: "PG_DIPLOMA", label: "PG Diploma in Yoga", sortOrder: 3 },
    { code: "MSC", label: "MSc Yoga", sortOrder: 4 },
    { code: "MA", label: "MA Yoga", sortOrder: 5 },
    { code: "MTECH", label: "MTech in Yoga", sortOrder: 6 },
    { code: "MPHIL", label: "MPhil in Yoga", sortOrder: 7 },
    { code: "PHD_SCHOLAR", label: "Yoga Research Scholar", sortOrder: 8 },
    { code: "PHD", label: "PhD in Yoga (Awarded)", sortOrder: 9 },
    { code: "OTHERS", label: "Others (certification only)", sortOrder: 10 },
  ];
  for (const row of yogaLevels) {
    await prisma.yogaQualificationLevel.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const professionalTypes = [
    "Yoga Teacher",
    "Yoga Trainer",
    "Yoga Instructor",
    "Yoga Consultant",
    "Yoga Professor",
    "Associate Yoga Professor",
    "Assistant Yoga Professor",
    "Yoga Lecturer",
    "Yoga Therapist",
    "Yoga Researcher",
    "Yogasana Coach",
    "Other",
  ].map((label, i) => ({
    code: label.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z_]/g, ""),
    label,
    sortOrder: i + 1,
  }));
  for (const row of professionalTypes) {
    await prisma.yogaProfessionalType.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const employmentStatuses = [
    "Student",
    "Employed in another field",
    "Self-employed",
    "Unemployed and seeking employment",
    "Preparing for competitive examinations",
    "Retired",
    "Other",
  ].map((label, i) => ({
    code: `EMP_${i + 1}`,
    label,
    sortOrder: i + 1,
  }));
  for (const row of employmentStatuses) {
    await prisma.employmentStatus.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const govOptions = [
    {
      code: "YES_ANYWHERE_AP",
      label: "Yes",
      sortOrder: 1,
    },
    {
      code: "NO",
      label: "No, not currently interested.",
      sortOrder: 2,
    },
    {
      code: "ALREADY_GOVT",
      label: "Already working in government service.",
      sortOrder: 3,
    },
  ];
  for (const row of govOptions) {
    await prisma.govWorkInterestOption.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const volunteer = [
    { code: "YES", label: "Yes", sortOrder: 1 },
    { code: "NO", label: "No", sortOrder: 2 },
    { code: "DEPENDS", label: "Depends on my availability", sortOrder: 3 },
  ];
  for (const row of volunteer) {
    await prisma.volunteerResponse.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const languages = [
    { code: "TELUGU", label: "Telugu", sortOrder: 1 },
    { code: "ENGLISH", label: "English", sortOrder: 2 },
    { code: "HINDI", label: "Hindi", sortOrder: 3 },
    { code: "OTHER", label: "Other (Please specify)", sortOrder: 4 },
  ];
  for (const row of languages) {
    await prisma.lectureLanguage.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const preferences = [
    "Permanent",
    "Contract",
    "Outsourcing",
    "Part-time",
    "Honorarium-based (per class/session)",
    "Project-based",
    "Any type of employment",
  ].map((label, i) => ({
    code: `PREF_${i + 1}`,
    label,
    sortOrder: i + 1,
  }));
  for (const row of preferences) {
    await prisma.employmentPreferenceType.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }

  const challenges = [
    "Lack of government recognition",
    "Lack of employment opportunities",
    "Lack of permanent Yoga Teacher posts",
    "Lack of career advancement and promotion opportunities",
    "Preference for other physical education/sports professionals over qualified Yoga professionals for Yoga posts",
  ].map((label, i) => ({
    code: `CH_${i + 1}`,
    label,
    sortOrder: i + 1,
  }));
  for (const row of challenges) {
    await prisma.professionalChallengeType.upsert({
      where: { code: row.code },
      create: row,
      update: { label: row.label, sortOrder: row.sortOrder },
    });
  }
}

async function seedAndhraGeography() {
  const ap = await prisma.state.upsert({
    where: { code: "AP" },
    create: { code: "AP", name: "Andhra Pradesh", sortOrder: 1 },
    update: { name: "Andhra Pradesh" },
  });

  const districtSeed: { name: string; mandals: string[] }[] = [
    {
      name: "Visakhapatnam",
      mandals: ["Visakhapatnam Rural", "Anakapalli", "Bheemunipatnam"],
    },
    {
      name: "Vijayawada",
      mandals: ["Vijayawada Central", "Vijayawada Rural", "Gannavaram"],
    },
    {
      name: "Guntur",
      mandals: ["Guntur Urban", "Tenali", "Mangalagiri"],
    },
    {
      name: "Tirupati",
      mandals: ["Tirupati Urban", "Chandragiri", "Renigunta"],
    },
    {
      name: "Kurnool",
      mandals: ["Kurnool Urban", "Nandyal", "Adoni"],
    },
  ];

  for (let di = 0; di < districtSeed.length; di++) {
    const d = districtSeed[di]!;
    const district = await prisma.district.upsert({
      where: {
        stateId_name: { stateId: ap.id, name: d.name },
      },
      create: {
        stateId: ap.id,
        name: d.name,
        sortOrder: di + 1,
      },
      update: { sortOrder: di + 1 },
    });

    for (let mi = 0; mi < d.mandals.length; mi++) {
      const mName = d.mandals[mi]!;
      await prisma.mandal.upsert({
        where: {
          districtId_name: { districtId: district.id, name: mName },
        },
        create: {
          districtId: district.id,
          name: mName,
          sortOrder: mi + 1,
        },
        update: { sortOrder: mi + 1 },
      });
    }
  }
}

async function seedFinanceCatalog() {
  const { Prisma } = await import("@prisma/client");
  await prisma.program.upsert({
    where: { code: "YOGA-EDU-101" },
    create: {
      code: "YOGA-EDU-101",
      title: "Yoga educator foundation programme",
      description: "Sample programme for finance catalog.",
      defaultFee: new Prisma.Decimal(2500),
      isActive: true,
    },
    update: {},
  });
  const program = await prisma.program.findUnique({ where: { code: "YOGA-EDU-101" } });
  if (program) {
    await prisma.event.upsert({
      where: { code: "CONF-2026" },
      create: {
        code: "CONF-2026",
        title: "Annual Yoga educators conference",
        programId: program.id,
        defaultFee: new Prisma.Decimal(1500),
        isActive: true,
      },
      update: {},
    });
    await prisma.subscriptionPlan.upsert({
      where: { code: "MEM-ANNUAL" },
      create: {
        code: "MEM-ANNUAL",
        title: "Annual membership subscription",
        basis: "MEMBERSHIP",
        durationMonths: 12,
        fee: new Prisma.Decimal(1000),
        isActive: true,
      },
      update: {},
    });
  }
}

async function main() {
  await seedLookups();
  await seedAndhraGeography();
  await seedDefaultAdminSettings();
  await seedFinanceCatalog();
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
