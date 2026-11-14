"use client";

import { useMemo } from "react";
import {
  FieldGrid,
  FormField,
  SecondaryButton,
  SelectField,
  TextField,
} from "@/components/ui/form-primitives";
import { passingYearOptions, YOGA_QUALIFICATION_OTHERS_CODE } from "@/lib/yoga-qualifications";

type Lookup = { id: string; code?: string; label?: string; name?: string };

function labelOf(item: Lookup) {
  return item.label ?? item.name ?? item.code ?? "";
}

export type YogaQualificationRow = {
  yogaQualificationLevelId: string;
  institutionName: string;
  yearOfCompletion: string;
  otherText: string;
};

export const emptyYogaQualificationRow = (): YogaQualificationRow => ({
  yogaQualificationLevelId: "",
  institutionName: "",
  yearOfCompletion: "",
  otherText: "",
});

export function SurveyYogaQualificationsEditor({
  rows,
  onChange,
  levels,
  yearFieldLabel = "Year of passing",
}: {
  rows: YogaQualificationRow[];
  onChange: (rows: YogaQualificationRow[]) => void;
  levels: Lookup[];
  yearFieldLabel?: string;
}) {
  const yearOptions = useMemo(() => {
    const base = passingYearOptions();
    const merged = new Set(base);
    for (const row of rows) {
      const y = Number(row.yearOfCompletion);
      if (Number.isFinite(y) && y > 0) merged.add(y);
    }
    return [...merged].sort((a, b) => b - a);
  }, [rows]);

  function updateRow(index: number, patch: Partial<YogaQualificationRow>) {
    const next = [...rows];
    next[index] = { ...next[index]!, ...patch };
    onChange(next);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <FormField
      span
      label="Yoga qualifications"
      hint="Add each qualification. You may choose the same level more than once (e.g. different institutes or years)."
    >
      <div className="space-y-4">
        {rows.map((row, index) => {
          const selected = levels.find((l) => l.id === row.yogaQualificationLevelId);
          const requiresOtherText = selected?.code === YOGA_QUALIFICATION_OTHERS_CODE;

          return (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-[#1E2E24]/10 bg-white p-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
                  Qualification {index + 1}
                </p>
                <SecondaryButton
                  type="button"
                  className="w-auto px-3 py-1.5 text-xs"
                  disabled={rows.length <= 1}
                  onClick={() => removeRow(index)}
                >
                  Remove
                </SecondaryButton>
              </div>
              <FieldGrid>
                <SelectField
                  span
                  label="Qualification related to Yoga"
                  value={row.yogaQualificationLevelId}
                  onChange={(yogaQualificationLevelId) =>
                    updateRow(index, {
                      yogaQualificationLevelId,
                      otherText:
                        levels.find((l) => l.id === yogaQualificationLevelId)?.code ===
                        YOGA_QUALIFICATION_OTHERS_CODE
                          ? row.otherText
                          : "",
                    })
                  }
                >
                  <option value="">Select</option>
                  {levels.map((q) => (
                    <option key={q.id} value={q.id}>
                      {labelOf(q)}
                    </option>
                  ))}
                </SelectField>
                {requiresOtherText ? (
                  <TextField
                    span
                    label="Please specify your qualification (Others)"
                    value={row.otherText}
                    onChange={(e) => updateRow(index, { otherText: e.target.value })}
                  />
                ) : null}
                <TextField
                  span
                  label="Name of Institute"
                  value={row.institutionName}
                  onChange={(e) => updateRow(index, { institutionName: e.target.value })}
                />
                <SelectField
                  label={yearFieldLabel}
                  value={row.yearOfCompletion}
                  onChange={(yearOfCompletion) => updateRow(index, { yearOfCompletion })}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </SelectField>
              </FieldGrid>
            </div>
          );
        })}
        <SecondaryButton
          type="button"
          className="w-auto"
          onClick={() => onChange([...rows, emptyYogaQualificationRow()])}
        >
          Add new
        </SecondaryButton>
      </div>
    </FormField>
  );
}
