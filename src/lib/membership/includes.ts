export const membershipApplicationInclude = {
  state: true,
  district: true,
  mandal: true,
  highestYogaQualificationLevel: true,
  yogaQualifications: {
    orderBy: { sortOrder: "asc" as const },
    include: { yogaQualificationLevel: true },
  },
  photoFile: true,
  identityProofFile: true,
  member: true,
  paymentRecords: { orderBy: { createdAt: "desc" as const } },
} as const;

export const memberDetailInclude = {
  photoFile: true,
  identityProofFile: true,
  membershipCardFile: true,
  membershipApplication: {
    include: {
      highestYogaQualificationLevel: true,
    },
  },
  renewalApplications: { orderBy: { submittedAt: "desc" as const }, take: 10 },
  paymentRecords: { orderBy: { createdAt: "desc" as const }, take: 20 },
} as const;
