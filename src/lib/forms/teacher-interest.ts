import {
  isGovTeacherInterestYes,
  SURVEY_GOV_LANGUAGE_QUESTION_LABEL,
  SURVEY_GOV_TEACHER_QUESTION_LABEL,
} from "@/lib/survey/copy";
import { firstValidationError, requiredSelectError } from "@/lib/validation";

export type TeacherInterestPayload = {
  govWorkInterestId: string;
  languageIds: string[];
  otherLanguageText?: string;
  employmentPreferenceIds: string[];
};

export function validateTeacherInterest(
  payload: TeacherInterestPayload,
  govInterestCodeById: (id: string) => string | undefined,
): string | null {
  const code = govInterestCodeById(payload.govWorkInterestId);
  const requiresExtras = isGovTeacherInterestYes(code);
  return firstValidationError(
    requiredSelectError(payload.govWorkInterestId, "yoga teacher interest"),
    requiresExtras && payload.languageIds.length === 0
      ? "Select at least one language for conducting yoga programmes"
      : null,
    requiresExtras && payload.employmentPreferenceIds.length === 0
      ? "Select at least one employment preference"
      : null,
  );
}

export {
  SURVEY_GOV_LANGUAGE_QUESTION_LABEL,
  SURVEY_GOV_TEACHER_QUESTION_LABEL,
  isGovTeacherInterestYes,
  sortGovLectureLanguages,
} from "@/lib/survey/copy";