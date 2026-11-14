/** Survey copy shared by public form, admin editor, filters, and review. */
export const SURVEY_VOLUNTEER_QUESTION_LABEL =
  "Would you be willing to volunteer your services for APYEA activities, including Yoga classes, training programmes, government projects, and community service initiatives?";

export const SURVEY_GOV_TEACHER_QUESTION_LABEL =
  "Are you interested in working as a Yoga Teacher in a government or public-sector institution?";

export const SURVEY_GOV_LANGUAGE_QUESTION_LABEL =
  "Which languages can you use to conduct Yoga lectures, classes, and training programmes?";

export const SURVEY_SELECT_ALL_THAT_APPLY_HINT = "Select all that apply.";

export const GOV_LECTURE_LANGUAGE_CODES = ["TELUGU", "ENGLISH", "HINDI", "OTHER"] as const;

export function isGovTeacherInterestYes(code: string | undefined | null): boolean {
  return code === "YES_ANYWHERE_AP" || code === "YES";
}

export function sortGovLectureLanguages<T extends { code?: string }>(items: T[]): T[] {
  const order = Object.fromEntries(GOV_LECTURE_LANGUAGE_CODES.map((c, i) => [c, i]));
  return items
    .filter((item) => item.code && item.code in order)
    .sort((a, b) => (order[a.code!] ?? 0) - (order[b.code!] ?? 0));
}
