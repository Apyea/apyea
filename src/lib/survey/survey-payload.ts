import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isGovTeacherInterestYes } from "@/lib/survey/copy";
import {
  normalizeYogaQualificationRows,
  resolveYogaQualificationRows,
  validateYogaQualificationRowsStructure,
  yogaQualificationRowsFromStored,
  YOGA_QUALIFICATION_OTHERS_CODE,
  type YogaQualificationRowInput,
} from "@/lib/yoga-qualifications";
import {
  validateSurveyExperienceFields,
  validateSurveyLocationFields,
  validateSurveyOpportunitiesFields,
  validateSurveyPersonalFields,
  validateSurveyReviewFields,
} from "@/lib/survey/validate-survey";
import { firstValidationError, requiredSelectError, throwIfValidationError } from "@/lib/validation";

export { YOGA_QUALIFICATION_OTHERS_CODE, type YogaQualificationRowInput };

export type SurveySubmitInput = Omit<
  SurveyPayload,
  | "highestYogaQualificationLevelId"
  | "yogaQualificationInstitutionName"
  | "yogaQualificationYearOfCompletion"
  | "highestYogaQualificationOtherText"
>;

export type SurveyPayload = {
  nameAsPerSsc: string;
  fatherOrHusbandName: string;
  genderId?: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  nationalityId: string;
  stateId: string;
  districtId: string;
  mandalId: string;
  addressLine: string;
  pincode?: string;
  yogaQualifications: YogaQualificationRowInput[];
  highestYogaQualificationLevelId: string;
  yogaQualificationInstitutionName: string;
  yogaQualificationYearOfCompletion: number;
  highestYogaQualificationOtherText?: string;
  yogaProfessionalTypeId: string;
  experienceYears?: number | null;
  experienceMonths?: number | null;
  experienceDays?: number | null;
  employmentStatusId: string;
  govWorkInterestId: string;
  volunteerResponseId: string;
  languageIds?: string[];
  otherLanguageText?: string;
  employmentPreferenceIds?: string[];
  challengeTypeIds: string[];
  consent?: boolean;
};

export async function resolveSurveyYogaQualifications(
  body: SurveySubmitInput,
): Promise<SurveyPayload> {
  const resolved = await resolveYogaQualificationRows(body);
  return {
    ...body,
    yogaQualifications: resolved.yogaQualifications,
    highestYogaQualificationLevelId: resolved.highestYogaQualificationLevelId,
    yogaQualificationInstitutionName: resolved.highestInstitutionName,
    yogaQualificationYearOfCompletion: resolved.highestYearOfCompletion,
    highestYogaQualificationOtherText:
      resolved.highestYogaQualificationOtherText ?? undefined,
  };
}

export function parseSurveyPayload(
  raw: unknown,
  options?: { requireConsent?: boolean },
): SurveySubmitInput {
  if (typeof raw === "string") {
    return parseSurveyPayload(JSON.parse(raw), options);
  }
  const body = raw as SurveySubmitInput;
  const requireConsent = options?.requireConsent !== false;

  validateSurveyPersonalFields({
    nameAsPerSsc: body.nameAsPerSsc,
    fatherOrHusbandName: body.fatherOrHusbandName,
    mobile: body.mobile,
    email: body.email,
    dateOfBirth: body.dateOfBirth,
  });

  throwIfValidationError(
    firstValidationError(
      validateSurveyLocationFields({
        nationalityId: body.nationalityId,
        stateId: body.stateId,
        districtId: body.districtId,
        mandalId: body.mandalId,
        addressLine: body.addressLine,
        pincode: body.pincode,
      }),
      requiredSelectError(body.yogaProfessionalTypeId, "professional type"),
      requiredSelectError(body.employmentStatusId, "employment status"),
      requiredSelectError(body.govWorkInterestId, "government teacher interest"),
      requiredSelectError(body.volunteerResponseId, "volunteer preference"),
    ),
  );

  const yogaQualifications = normalizeYogaQualificationRows(body.yogaQualifications);
  validateYogaQualificationRowsStructure(yogaQualifications);

  if (requireConsent) {
    throwIfValidationError(validateSurveyReviewFields({ challengeTypeIds: body.challengeTypeIds, consent: Boolean(body.consent) }));
  } else if (!body.challengeTypeIds?.length) {
    throw new Error("Select at least one challenge");
  }

  return { ...body, yogaQualifications };
}

export function yogaQualificationRowsFromSurvey(
  source: Parameters<typeof yogaQualificationRowsFromStored>[0] & {
    yogaQualificationInstitutionName?: string;
    yogaQualificationYearOfCompletion?: number;
  },
): YogaQualificationRowInput[] {
  return yogaQualificationRowsFromStored({
    yogaQualifications: source.yogaQualifications,
    highestYogaQualificationLevelId: source.highestYogaQualificationLevelId,
    primaryInstitutionName: source.yogaQualificationInstitutionName,
    primaryYearOfCompletion: source.yogaQualificationYearOfCompletion,
    highestYogaQualificationOtherText: source.highestYogaQualificationOtherText,
  });
}

export async function govWorkRequiresExtras(govWorkInterestId: string) {
  const gov = await prisma.govWorkInterestOption.findUnique({
    where: { id: govWorkInterestId },
  });
  return isGovTeacherInterestYes(gov?.code);
}

export function validateGovExtras(payload: SurveyPayload, requiresGovExtras: boolean) {
  if (!requiresGovExtras) return;
  if (!payload.languageIds?.length) {
    throw new Error("Select at least one language for lectures and training");
  }
  if (!payload.employmentPreferenceIds?.length) {
    throw new Error("Select at least one employment preference");
  }
}

function yogaQualificationScalarFields(payload: SurveyPayload) {
  return {
    yogaQualificationInstitutionName: payload.yogaQualificationInstitutionName.trim(),
    yogaQualificationYearOfCompletion: Number(payload.yogaQualificationYearOfCompletion),
    highestYogaQualificationOtherText: payload.highestYogaQualificationOtherText?.trim() || null,
  };
}

function scalarSurveyData(payload: SurveyPayload): Prisma.EducatorSurveyUpdateInput {
  return {
    nameAsPerSsc: payload.nameAsPerSsc.trim(),
    fatherOrHusbandName: payload.fatherOrHusbandName.trim(),
    gender: payload.genderId ? { connect: { id: payload.genderId } } : { disconnect: true },
    mobile: payload.mobile,
    email: payload.email.trim().toLowerCase(),
    dateOfBirth: new Date(payload.dateOfBirth),
    nationality: { connect: { id: payload.nationalityId } },
    state: { connect: { id: payload.stateId } },
    district: { connect: { id: payload.districtId } },
    mandal: { connect: { id: payload.mandalId } },
    addressLine: payload.addressLine.trim(),
    pincode: payload.pincode?.trim() || null,
    highestYogaQualificationLevel: { connect: { id: payload.highestYogaQualificationLevelId } },
    ...yogaQualificationScalarFields(payload),
    yogaProfessionalType: { connect: { id: payload.yogaProfessionalTypeId } },
    experienceYears: payload.experienceYears ?? null,
    experienceMonths: payload.experienceMonths ?? null,
    experienceDays: payload.experienceDays ?? null,
    employmentStatus: { connect: { id: payload.employmentStatusId } },
    govWorkInterest: { connect: { id: payload.govWorkInterestId } },
    volunteerResponse: { connect: { id: payload.volunteerResponseId } },
  };
}

export async function replaceSurveyRelations(
  tx: Prisma.TransactionClient,
  surveyId: string,
  payload: SurveyPayload,
  requiresGovExtras: boolean,
) {
  await tx.educatorSurveyLanguage.deleteMany({ where: { educatorSurveyId: surveyId } });
  if (requiresGovExtras && payload.languageIds?.length) {
    await tx.educatorSurveyLanguage.createMany({
      data: payload.languageIds.map((languageId) => ({
        educatorSurveyId: surveyId,
        languageId,
        otherLanguageText: payload.otherLanguageText?.trim() || null,
      })),
    });
  }

  await tx.educatorSurveyEmploymentPreference.deleteMany({ where: { educatorSurveyId: surveyId } });
  if (requiresGovExtras && payload.employmentPreferenceIds?.length) {
    await tx.educatorSurveyEmploymentPreference.createMany({
      data: payload.employmentPreferenceIds.map((preferenceTypeId) => ({
        educatorSurveyId: surveyId,
        preferenceTypeId,
      })),
    });
  }

  await tx.educatorSurveyChallenge.deleteMany({ where: { educatorSurveyId: surveyId } });
  await tx.educatorSurveyChallenge.createMany({
    data: payload.challengeTypeIds.map((challengeTypeId) => ({
      educatorSurveyId: surveyId,
      challengeTypeId,
    })),
  });

  const yogaQualifications = normalizeYogaQualificationRows(payload.yogaQualifications);
  await tx.educatorSurveyYogaQualification.deleteMany({ where: { educatorSurveyId: surveyId } });
  if (yogaQualifications.length) {
    await tx.educatorSurveyYogaQualification.createMany({
      data: yogaQualifications.map((q, i) => ({
        educatorSurveyId: surveyId,
        yogaQualificationLevelId: q.yogaQualificationLevelId,
        otherText: q.otherText?.trim() || null,
        institutionName: q.institutionName,
        yearOfCompletion: q.yearOfCompletion,
        sortOrder: i,
      })),
    });
  }
}

export async function updateEducatorSurveyFromPayload(surveyId: string, payload: SurveyPayload) {
  const requiresGovExtras = await govWorkRequiresExtras(payload.govWorkInterestId);
  validateGovExtras(payload, requiresGovExtras);

  await prisma.$transaction(async (tx) => {
    await tx.educatorSurvey.update({
      where: { id: surveyId },
      data: scalarSurveyData(payload),
    });
    await replaceSurveyRelations(tx, surveyId, payload, requiresGovExtras);
  });
}

export function buildSurveyCreateNested(
  payload: SurveyPayload,
  requiresGovExtras: boolean,
): Pick<
  Prisma.EducatorSurveyCreateInput,
  "languages" | "employmentPreferences" | "challenges" | "yogaQualifications"
> {
  const yogaQualifications = normalizeYogaQualificationRows(payload.yogaQualifications);
  return {
    yogaQualifications: yogaQualifications.length
      ? {
          create: yogaQualifications.map((q, i) => ({
            yogaQualificationLevelId: q.yogaQualificationLevelId,
            otherText: q.otherText?.trim() || null,
            institutionName: q.institutionName,
            yearOfCompletion: q.yearOfCompletion,
            sortOrder: i,
          })),
        }
      : undefined,
    languages: requiresGovExtras
      ? {
          create: payload.languageIds!.map((languageId) => ({
            languageId,
            otherLanguageText: payload.otherLanguageText?.trim() || null,
          })),
        }
      : undefined,
    employmentPreferences: requiresGovExtras
      ? {
          create: payload.employmentPreferenceIds!.map((preferenceTypeId) => ({
            preferenceTypeId,
          })),
        }
      : undefined,
    challenges: {
      create: payload.challengeTypeIds.map((challengeTypeId) => ({
        challengeTypeId,
      })),
    },
  };
}

export function surveyYogaQualificationScalars(payload: SurveyPayload) {
  return yogaQualificationScalarFields(payload);
}
