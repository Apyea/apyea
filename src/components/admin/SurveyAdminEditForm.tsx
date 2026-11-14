"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useStore } from "@/components/ui/tanstack-form";
import {
  CheckboxRow,
  DateField,
  FieldGrid,
  FormField,
  PrimaryButton,
  RadioRow,
  SecondaryButton,
  SelectField,
  StepCard,
  TextAreaField,
  TextField,
} from "@/components/ui/form-primitives";
import { DetailReviewSkeleton } from "@/components/ui/skeleton";
import {
  isGovTeacherInterestYes,
  sortGovLectureLanguages,
  SURVEY_GOV_LANGUAGE_QUESTION_LABEL,
  SURVEY_GOV_TEACHER_QUESTION_LABEL,
  SURVEY_SELECT_ALL_THAT_APPLY_HINT,
  SURVEY_VOLUNTEER_QUESTION_LABEL,
} from "@/lib/survey/copy";
import {
  emptyYogaQualificationRow,
  SurveyYogaQualificationsEditor,
  type YogaQualificationRow,
} from "@/components/survey/SurveyYogaQualificationsEditor";
import { normalizeYogaQualificationRows } from "@/lib/yoga-qualifications";
import {
  yogaQualificationRowsFromSurvey,
  type SurveySubmitInput,
} from "@/lib/survey/survey-payload";

type Lookup = { id: string; code?: string; label?: string; name?: string };

type MasterBundle = {
  genders: Lookup[];
  nationalities: Lookup[];
  states: Lookup[];
  yogaQualificationLevels: Lookup[];
  yogaProfessionalTypes: Lookup[];
  employmentStatuses: Lookup[];
  govWorkInterestOptions: Lookup[];
  volunteerResponses: Lookup[];
  lectureLanguages: Lookup[];
  employmentPreferenceTypes: Lookup[];
  professionalChallengeTypes: Lookup[];
};

export type SurveyEditSource = {
  nameAsPerSsc: string;
  fatherOrHusbandName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  addressLine: string;
  pincode: string | null;
  experienceYears: number | null;
  experienceMonths: number | null;
  experienceDays: number | null;
  gender?: { id: string } | null;
  nationality?: { id: string } | null;
  state?: { id: string } | null;
  district?: { id: string } | null;
  mandal?: { id: string } | null;
  highestYogaQualificationLevel?: { id: string; code?: string } | null;
  yogaQualificationInstitutionName: string;
  yogaQualificationYearOfCompletion: number;
  highestYogaQualificationOtherText: string | null;
  yogaProfessionalType?: { id: string } | null;
  employmentStatus?: { id: string } | null;
  govWorkInterest?: { id: string; code?: string } | null;
  volunteerResponse?: { id: string } | null;
  yogaQualifications?: {
    yogaQualificationLevelId: string;
    institutionName: string;
    yearOfCompletion: number;
    otherText: string | null;
    yogaQualificationLevel?: Lookup;
  }[];
  languages?: { language: Lookup; otherLanguageText: string | null }[];
  employmentPreferences?: { preferenceType: Lookup }[];
  challenges?: { challengeType: Lookup }[];
};

function labelOf(item: Lookup) {
  return item.label ?? item.name ?? item.code ?? item.id;
}

function isoDateOnly(value: string) {
  return value.slice(0, 10);
}

function surveyToFormState(source: SurveyEditSource) {
  const teaching =
    source.experienceYears != null ||
    source.experienceMonths != null ||
    source.experienceDays != null;
  return {
    nameAsPerSsc: source.nameAsPerSsc,
    fatherOrHusbandName: source.fatherOrHusbandName,
    genderId: source.gender?.id ?? "",
    mobile: source.mobile,
    email: source.email,
    dateOfBirth: isoDateOnly(source.dateOfBirth),
    nationalityId: source.nationality?.id ?? "",
    stateId: source.state?.id ?? "",
    districtId: source.district?.id ?? "",
    mandalId: source.mandal?.id ?? "",
    addressLine: source.addressLine,
    pincode: source.pincode ?? "",
    yogaQualifications: (() => {
      const rows = yogaQualificationRowsFromSurvey({
        yogaQualifications: source.yogaQualifications,
        highestYogaQualificationLevelId: source.highestYogaQualificationLevel?.id,
        yogaQualificationInstitutionName: source.yogaQualificationInstitutionName,
        yogaQualificationYearOfCompletion: source.yogaQualificationYearOfCompletion,
        highestYogaQualificationOtherText: source.highestYogaQualificationOtherText,
      });
      return rows.length
        ? rows.map(
            (q): YogaQualificationRow => ({
              yogaQualificationLevelId: q.yogaQualificationLevelId,
              institutionName: q.institutionName,
              yearOfCompletion: String(q.yearOfCompletion || ""),
              otherText: q.otherText ?? "",
            }),
          )
        : [emptyYogaQualificationRow()];
    })(),
    yogaProfessionalTypeId: source.yogaProfessionalType?.id ?? "",
    currentlyTeaching: teaching,
    experienceYears: source.experienceYears != null ? String(source.experienceYears) : "",
    experienceMonths: source.experienceMonths != null ? String(source.experienceMonths) : "",
    experienceDays: source.experienceDays != null ? String(source.experienceDays) : "",
    employmentStatusId: source.employmentStatus?.id ?? "",
    govWorkInterestId: source.govWorkInterest?.id ?? "",
    volunteerResponseId: source.volunteerResponse?.id ?? "",
    languageIds: source.languages?.map((l) => l.language.id) ?? [],
    otherLanguageText: source.languages?.find((l) => l.otherLanguageText)?.otherLanguageText ?? "",
    employmentPreferenceIds:
      source.employmentPreferences?.map((p) => p.preferenceType.id) ?? [],
    challengeTypeIds: source.challenges?.map((c) => c.challengeType.id) ?? [],
  };
}

export function SurveyAdminEditForm({
  surveyId,
  source,
  onSaved,
  onCancel,
}: {
  surveyId: string;
  source: SurveyEditSource;
  onSaved: (survey: unknown) => void;
  onCancel: () => void;
}) {
  const [master, setMaster] = useState<MasterBundle | null>(null);
  const [districts, setDistricts] = useState<Lookup[]>([]);
  const [mandals, setMandals] = useState<Lookup[]>([]);
  type SurveyAdminFormValues = ReturnType<typeof surveyToFormState>;
  const editForm = useForm({
    defaultValues: surveyToFormState(source),
  });
  const form = useStore(editForm.store, (s) => s.values);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    editForm.reset(surveyToFormState(source));
  }, [source, editForm]);

  useEffect(() => {
    fetch("/api/master")
      .then((r) => r.json())
      .then(setMaster)
      .catch(() => setError("Failed to load form options"));
  }, []);

  const loadDistricts = useCallback(async (stateId: string) => {
    const res = await fetch(`/api/master/districts?stateId=${stateId}`);
    const data = await res.json();
    setDistricts(data.items ?? []);
  }, []);

  const loadMandals = useCallback(async (districtId: string) => {
    const res = await fetch(`/api/master/mandals?districtId=${districtId}`);
    const data = await res.json();
    setMandals(data.items ?? []);
  }, []);

  useEffect(() => {
    if (form.stateId) void loadDistricts(form.stateId);
    else {
      setDistricts([]);
      setMandals([]);
    }
  }, [form.stateId, loadDistricts]);

  useEffect(() => {
    if (form.districtId) void loadMandals(form.districtId);
    else setMandals([]);
  }, [form.districtId, loadMandals]);

  const selectedGov = useMemo(() => {
    if (!master) return null;
    return master.govWorkInterestOptions.find((g) => g.id === form.govWorkInterestId);
  }, [master, form.govWorkInterestId]);

  const requiresGovExtras = isGovTeacherInterestYes(selectedGov?.code);

  function updateField<K extends keyof SurveyAdminFormValues>(key: K, value: SurveyAdminFormValues[K]) {
    editForm.setFieldValue(key, value as never);
  }

  function toggleId(list: string[], id: string) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  async function save() {
    setError(null);
    setLoading(true);
    try {
      const payload: SurveySubmitInput = {
        nameAsPerSsc: form.nameAsPerSsc,
        fatherOrHusbandName: form.fatherOrHusbandName,
        genderId: form.genderId || undefined,
        mobile: form.mobile,
        email: form.email,
        dateOfBirth: form.dateOfBirth,
        nationalityId: form.nationalityId,
        stateId: form.stateId,
        districtId: form.districtId,
        mandalId: form.mandalId,
        addressLine: form.addressLine,
        pincode: form.pincode || undefined,
        yogaQualifications: normalizeYogaQualificationRows(
          form.yogaQualifications.map((r) => ({
            yogaQualificationLevelId: r.yogaQualificationLevelId,
            institutionName: r.institutionName,
            yearOfCompletion: Number(r.yearOfCompletion || 0),
            otherText: r.otherText || undefined,
          })),
        ),
        yogaProfessionalTypeId: form.yogaProfessionalTypeId,
        experienceYears: form.currentlyTeaching ? Number(form.experienceYears || 0) : null,
        experienceMonths: form.currentlyTeaching ? Number(form.experienceMonths || 0) : null,
        experienceDays: form.currentlyTeaching ? Number(form.experienceDays || 0) : null,
        employmentStatusId: form.employmentStatusId,
        govWorkInterestId: form.govWorkInterestId,
        volunteerResponseId: form.volunteerResponseId,
        languageIds: requiresGovExtras ? form.languageIds : [],
        otherLanguageText: form.otherLanguageText || undefined,
        employmentPreferenceIds: requiresGovExtras ? form.employmentPreferenceIds : [],
        challengeTypeIds: form.challengeTypeIds,
      };

      const res = await fetch(`/api/admin/surveys/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      onSaved(data.survey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  if (!master) {
    return <DetailReviewSkeleton />;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <StepCard label="Personal details">
        <FieldGrid>
          <TextField
            label="Name as per SSC"
            value={form.nameAsPerSsc}
            onChange={(e) => updateField("nameAsPerSsc", e.target.value)}
          />
          <TextField
            label="Name of Father / Husband"
            value={form.fatherOrHusbandName}
            onChange={(e) => updateField("fatherOrHusbandName", e.target.value)}
          />
          <TextField
            label="Mobile (10 digits)"
            inputMode="numeric"
            maxLength={10}
            value={form.mobile}
            onChange={(e) =>
              updateField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
          <DateField
            label="Date of birth"
            value={form.dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
          />
          <FormField span label="Gender">
            <div className="grid gap-2 sm:grid-cols-2">
              {master.genders.map((g) => (
                <RadioRow
                  key={g.id}
                  name="admin-gender"
                  value={g.id}
                  checked={form.genderId === g.id}
                  onChange={() => updateField("genderId", g.id)}
                  label={labelOf(g)}
                />
              ))}
            </div>
          </FormField>
        </FieldGrid>
      </StepCard>

      <StepCard label="Location & identity">
        <FieldGrid>
          <SelectField
            label="Nationality"
            value={form.nationalityId}
            onChange={(nationalityId) => updateField("nationalityId", nationalityId)}
          >
            {master.nationalities.map((n) => (
              <option key={n.id} value={n.id}>
                {labelOf(n)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="State"
            value={form.stateId}
            onChange={(stateId) =>
              {
                editForm.setFieldValue("stateId", stateId);
                editForm.setFieldValue("districtId", "");
                editForm.setFieldValue("mandalId", "");
              }
            }
          >
            {master.states.map((s) => (
              <option key={s.id} value={s.id}>
                {labelOf(s)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="District"
            value={form.districtId}
            disabled={!form.stateId}
            onChange={(districtId) => {
              editForm.setFieldValue("districtId", districtId);
              editForm.setFieldValue("mandalId", "");
            }}
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {labelOf(d)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Mandal"
            value={form.mandalId}
            disabled={!form.districtId}
            onChange={(mandalId) => updateField("mandalId", mandalId)}
          >
            {mandals.map((m) => (
              <option key={m.id} value={m.id}>
                {labelOf(m)}
              </option>
            ))}
          </SelectField>
          <TextAreaField
            span
            label="Full address with pincode"
            value={form.addressLine}
            onChange={(e) => updateField("addressLine", e.target.value)}
          />
          <TextField
            label="Pincode"
            hint="Optional if included in address"
            maxLength={6}
            value={form.pincode}
            onChange={(e) =>
              updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </FieldGrid>
      </StepCard>

      <StepCard label="Qualification & experience">
        <FieldGrid>
          <SurveyYogaQualificationsEditor
            rows={form.yogaQualifications}
            levels={master.yogaQualificationLevels}
            onChange={(yogaQualifications) => updateField("yogaQualifications", yogaQualifications)}
          />
          <SelectField
            span
            label="Type of yoga professional"
            value={form.yogaProfessionalTypeId}
            onChange={(id) => updateField("yogaProfessionalTypeId", id)}
          >
            {master.yogaProfessionalTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {labelOf(t)}
              </option>
            ))}
          </SelectField>
          <FormField span>
            <CheckboxRow
              checked={form.currentlyTeaching}
              onChange={(v) => updateField("currentlyTeaching", v)}
              label="Currently teaching yoga (experience applies)"
            />
          </FormField>
          {form.currentlyTeaching ? (
            <>
              <TextField
                label="Years"
                inputMode="numeric"
                value={form.experienceYears}
                onChange={(e) =>
                  updateField("experienceYears", e.target.value.replace(/\D/g, ""))
                }
              />
              <TextField
                label="Months"
                inputMode="numeric"
                value={form.experienceMonths}
                onChange={(e) =>
                  updateField("experienceMonths", e.target.value.replace(/\D/g, ""))
                }
              />
              <TextField
                label="Days"
                inputMode="numeric"
                value={form.experienceDays}
                onChange={(e) =>
                  updateField("experienceDays", e.target.value.replace(/\D/g, ""))
                }
              />
            </>
          ) : null}
          <SelectField
            span
            label="Employment status"
            value={form.employmentStatusId}
            onChange={(id) => updateField("employmentStatusId", id)}
          >
            {master.employmentStatuses.map((s) => (
              <option key={s.id} value={s.id}>
                {labelOf(s)}
              </option>
            ))}
          </SelectField>
        </FieldGrid>
      </StepCard>

      <StepCard label="Opportunities">
        <FieldGrid>
          <FormField span label={SURVEY_GOV_TEACHER_QUESTION_LABEL}>
            <div className="grid gap-2 sm:grid-cols-2">
              {master.govWorkInterestOptions.map((o) => (
                <RadioRow
                  key={o.id}
                  name="admin-gov"
                  value={o.id}
                  checked={form.govWorkInterestId === o.id}
                  onChange={() => updateField("govWorkInterestId", o.id)}
                  label={labelOf(o)}
                />
              ))}
            </div>
          </FormField>
          {requiresGovExtras ? (
            <>
              <FormField
                span
                label={SURVEY_GOV_LANGUAGE_QUESTION_LABEL}
                hint={SURVEY_SELECT_ALL_THAT_APPLY_HINT}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {sortGovLectureLanguages(master.lectureLanguages).map((lang) => (
                    <CheckboxRow
                      key={lang.id}
                      checked={form.languageIds.includes(lang.id)}
                      onChange={() =>
                        updateField("languageIds", toggleId(form.languageIds, lang.id))
                      }
                      label={labelOf(lang)}
                    />
                  ))}
                </div>
              </FormField>
              {master.lectureLanguages.some(
                (l) => l.code === "OTHER" && form.languageIds.includes(l.id),
              ) ? (
                <TextField
                  label="Other (Please specify)"
                  value={form.otherLanguageText}
                  onChange={(e) => updateField("otherLanguageText", e.target.value)}
                />
              ) : null}
              <FormField span label="Preferred employment types">
                <div className="grid gap-2 sm:grid-cols-2">
                  {master.employmentPreferenceTypes.map((p) => (
                    <CheckboxRow
                      key={p.id}
                      checked={form.employmentPreferenceIds.includes(p.id)}
                      onChange={() =>
                        updateField(
                          "employmentPreferenceIds",
                          toggleId(form.employmentPreferenceIds, p.id),
                        )
                      }
                      label={labelOf(p)}
                    />
                  ))}
                </div>
              </FormField>
            </>
          ) : null}
          <FormField span label={SURVEY_VOLUNTEER_QUESTION_LABEL}>
            <div className="grid gap-2 sm:grid-cols-2">
              {master.volunteerResponses.map((v) => (
                <RadioRow
                  key={v.id}
                  name="admin-volunteer"
                  value={v.id}
                  checked={form.volunteerResponseId === v.id}
                  onChange={() => updateField("volunteerResponseId", v.id)}
                  label={labelOf(v)}
                />
              ))}
            </div>
          </FormField>
        </FieldGrid>
      </StepCard>

      <StepCard label="Challenges">
        <FormField span label="Select all major challenges that apply">
          <div className="grid gap-2 sm:grid-cols-2">
            {master.professionalChallengeTypes.map((c) => (
              <CheckboxRow
                key={c.id}
                checked={form.challengeTypeIds.includes(c.id)}
                onChange={() =>
                  updateField("challengeTypeIds", toggleId(form.challengeTypeIds, c.id))
                }
                label={labelOf(c)}
              />
            ))}
          </div>
        </FormField>
      </StepCard>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton type="button" className="w-auto" disabled={loading} onClick={() => void save()}>
          {loading ? "Saving…" : "Save changes"}
        </PrimaryButton>
        <SecondaryButton type="button" className="w-auto" disabled={loading} onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </div>
    </div>
  );
}
