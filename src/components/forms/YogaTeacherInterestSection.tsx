"use client";

import {
  CheckboxRow,
  FormField,
  RadioRow,
  TextField,
} from "@/components/ui/form-primitives";
import {
  isGovTeacherInterestYes,
  sortGovLectureLanguages,
  SURVEY_GOV_LANGUAGE_QUESTION_LABEL,
  SURVEY_GOV_TEACHER_QUESTION_LABEL,
  type TeacherInterestPayload,
} from "@/lib/forms/teacher-interest";
import { SURVEY_SELECT_ALL_THAT_APPLY_HINT } from "@/lib/survey/copy";

type Lookup = { id: string; code?: string; label?: string; name?: string };

function labelOf(item: Lookup) {
  return item.label ?? item.name ?? item.code ?? item.id;
}

function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export function YogaTeacherInterestSection({
  value,
  onChange,
  govWorkInterestOptions,
  lectureLanguages,
  employmentPreferenceTypes,
}: {
  value: TeacherInterestPayload;
  onChange: (next: TeacherInterestPayload) => void;
  govWorkInterestOptions: Lookup[];
  lectureLanguages: Lookup[];
  employmentPreferenceTypes: Lookup[];
}) {
  const selectedCode = govWorkInterestOptions.find((o) => o.id === value.govWorkInterestId)?.code;
  const requiresExtras = isGovTeacherInterestYes(selectedCode);

  return (
  <>
      <FormField span label={SURVEY_GOV_TEACHER_QUESTION_LABEL}>
        <div className="grid gap-2 sm:grid-cols-2">
          {govWorkInterestOptions.map((o) => (
            <RadioRow
              key={o.id}
              name="teacher-interest"
              value={o.id}
              checked={value.govWorkInterestId === o.id}
              onChange={() => onChange({ ...value, govWorkInterestId: o.id })}
              label={labelOf(o)}
            />
          ))}
        </div>
      </FormField>
      {requiresExtras ? (
        <>
          <FormField
            span
            label={SURVEY_GOV_LANGUAGE_QUESTION_LABEL}
            hint={SURVEY_SELECT_ALL_THAT_APPLY_HINT}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {sortGovLectureLanguages(lectureLanguages).map((lang) => (
                <CheckboxRow
                  key={lang.id}
                  checked={value.languageIds.includes(lang.id)}
                  onChange={() =>
                    onChange({
                      ...value,
                      languageIds: toggleId(value.languageIds, lang.id),
                    })
                  }
                  label={labelOf(lang)}
                />
              ))}
            </div>
          </FormField>
          {lectureLanguages.some(
            (l) => l.code === "OTHER" && value.languageIds.includes(l.id),
          ) ? (
            <TextField
              label="Other (please specify)"
              value={value.otherLanguageText ?? ""}
              onChange={(e) => onChange({ ...value, otherLanguageText: e.target.value })}
            />
          ) : null}
          <FormField span label="What type of employment would you prefer?">
            <div className="grid gap-2 sm:grid-cols-2">
              {employmentPreferenceTypes.map((p) => (
                <CheckboxRow
                  key={p.id}
                  checked={value.employmentPreferenceIds.includes(p.id)}
                  onChange={() =>
                    onChange({
                      ...value,
                      employmentPreferenceIds: toggleId(value.employmentPreferenceIds, p.id),
                    })
                  }
                  label={labelOf(p)}
                />
              ))}
            </div>
          </FormField>
        </>
      ) : null}
    </>
  );
}

export const EMPTY_TEACHER_INTEREST: TeacherInterestPayload = {
  govWorkInterestId: "",
  languageIds: [],
  otherLanguageText: "",
  employmentPreferenceIds: [],
};