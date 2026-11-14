export const educatorSurveyDetailInclude = {
  gender: true,
  nationality: true,
  state: true,
  district: true,
  mandal: true,
  highestYogaQualificationLevel: true,
  yogaProfessionalType: true,
  employmentStatus: true,
  govWorkInterest: true,
  volunteerResponse: true,
  yogaQualifications: {
    orderBy: { sortOrder: "asc" as const },
    include: { yogaQualificationLevel: true },
  },
  languages: { include: { language: true } },
  employmentPreferences: { include: { preferenceType: true } },
  challenges: { include: { challengeType: true } },
} as const;
