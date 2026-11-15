import {
  addressLineError,
  dateOfBirthError,
  emailError,
  experienceError,
  firstValidationError,
  indianMobileError,
  nonEmptySelectionError,
  personNameError,
  pincodeError,
  requiredSelectError,
  throwIfValidationError,
} from "@/lib/validation";

export function validateSurveyPersonalFields(fields: {
  nameAsPerSsc: string;
  fatherOrHusbandName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
}): void {
  throwIfValidationError(
    firstValidationError(
      personNameError(fields.nameAsPerSsc, "Name as per SSC"),
      personNameError(fields.fatherOrHusbandName, "Father/Husband name"),
      indianMobileError(fields.mobile),
      emailError(fields.email),
      dateOfBirthError(fields.dateOfBirth),
    ),
  );
}

export function validateSurveyLocationFields(fields: {
  nationalityId: string;
  stateId: string;
  districtId: string;
  mandalId: string;
  addressLine: string;
  pincode?: string;
}): string | null {
  return firstValidationError(
    requiredSelectError(fields.nationalityId, "nationality"),
    requiredSelectError(fields.stateId, "state"),
    requiredSelectError(fields.districtId, "district"),
    requiredSelectError(fields.mandalId, "mandal"),
    addressLineError(fields.addressLine),
    pincodeError(fields.pincode, true),
  );
}

export function validateSurveyExperienceFields(fields: {
  yogaProfessionalTypeId: string;
  currentlyTeaching: boolean;
  experienceYears: string;
  experienceMonths: string;
  experienceDays: string;
}): string | null {
  const typeErr = requiredSelectError(fields.yogaProfessionalTypeId, "professional type");
  if (typeErr) return typeErr;
  return experienceError(
    fields.experienceYears,
    fields.experienceMonths,
    fields.experienceDays,
    fields.currentlyTeaching,
  );
}

export function validateSurveyOpportunitiesFields(fields: {
  govWorkInterestId: string;
  volunteerResponseId: string;
  requiresGovExtras: boolean;
  languageIds: string[];
  employmentPreferenceIds: string[];
}): string | null {
  return firstValidationError(
    requiredSelectError(fields.govWorkInterestId, "an option for the government teacher question"),
    requiredSelectError(fields.volunteerResponseId, "volunteer preference"),
    fields.requiresGovExtras
      ? nonEmptySelectionError(fields.languageIds, "Select at least one language")
      : null,
    fields.requiresGovExtras
      ? nonEmptySelectionError(
          fields.employmentPreferenceIds,
          "Select at least one employment preference",
        )
      : null,
  );
}

export function validateSurveyChallengesFields(fields: {
  challengeTypeIds: string[];
}): string | null {
  return nonEmptySelectionError(fields.challengeTypeIds, "Select at least one challenge");
}

export function validateSurveyConsentFields(fields: { consent: boolean }): string | null {
  return fields.consent ? null : "Consent is required";
}
