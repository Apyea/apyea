"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useStore } from "@/components/ui/tanstack-form";
import {
  CheckboxRow,
  DateField,
  FieldGrid,
  FormField,
  FormShell,
  PrimaryButton,
  RadioRow,
  SecondaryButton,
  SelectField,
  StepCard,
  StepperNav,
  TextAreaField,
  TextField,
} from "@/components/ui/form-primitives";
import {
  emptyYogaQualificationRow,
  SurveyYogaQualificationsEditor,
  type YogaQualificationRow,
} from "@/components/survey/SurveyYogaQualificationsEditor";
import {
  validateSurveyExperienceFields,
  validateSurveyLocationFields,
  validateSurveyOpportunitiesFields,
  validateSurveyPersonalFields,
  validateSurveyChallengesFields,
  validateSurveyConsentFields,
} from "@/lib/survey/validate-survey";
import {
  normalizeYogaQualificationRows,
  validateYogaQualificationRowsStructure,
  YOGA_QUALIFICATION_OTHERS_CODE,
} from "@/lib/yoga-qualifications";
import {
  isGovTeacherInterestYes,
  sortGovLectureLanguages,
  SURVEY_GOV_LANGUAGE_QUESTION_LABEL,
  SURVEY_GOV_TEACHER_QUESTION_LABEL,
  SURVEY_SELECT_ALL_THAT_APPLY_HINT,
  SURVEY_VOLUNTEER_QUESTION_LABEL,
} from "@/lib/survey/copy";

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

const STEPS = [
  { id: "personal", title: "Personal" },
  { id: "location", title: "Location" },
  { id: "education", title: "Yoga Qualification" },
  { id: "experience", title: "Experience" },
  { id: "employment", title: "Employment" },
  { id: "opportunities", title: "Opportunities" },
  { id: "challenges", title: "Challenges" },
  { id: "declaration", title: "Declaration" },
] as const;

function labelOf(item: Lookup) {
  return item.label ?? item.name ?? item.code ?? item.id;
}

const EMPTY_SURVEY_VALUES = {
  nameAsPerSsc: "",
  fatherOrHusbandName: "",
  genderId: "",
  mobile: "",
  email: "",
  dateOfBirth: "",
  nationalityId: "",
  stateId: "",
  districtId: "",
  mandalId: "",
  addressLine: "",
  pincode: "",
  yogaQualifications: [emptyYogaQualificationRow()] as YogaQualificationRow[],
  yogaProfessionalTypeId: "",
  currentlyTeaching: true,
  experienceYears: "",
  experienceMonths: "",
  experienceDays: "",
  employmentStatusId: "",
  govWorkInterestId: "",
  volunteerResponseId: "",
  languageIds: [] as string[],
  otherLanguageText: "",
  employmentPreferenceIds: [] as string[],
  challengeTypeIds: [] as string[],
  consent: false,
};

type EducatorSurveyFormValues = typeof EMPTY_SURVEY_VALUES;

export function EducatorSurveyForm() {
  const [step, setStep] = useState(0);
  const [master, setMaster] = useState<MasterBundle | null>(null);
  const [districts, setDistricts] = useState<Lookup[]>([]);
  const [mandals, setMandals] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const surveyForm = useForm({ defaultValues: EMPTY_SURVEY_VALUES });
  const form = useStore(surveyForm.store, (s) => s.values);

  useEffect(() => {
    fetch("/api/master")
      .then((r) => r.json())
      .then(setMaster)
      .catch(() => setError("Failed to load form options"));
  }, []);

  const selectedGov = useMemo(() => {
    if (!master) return null;
    return master.govWorkInterestOptions.find((g) => g.id === form.govWorkInterestId);
  }, [master, form.govWorkInterestId]);

  const requiresGovExtras = isGovTeacherInterestYes(selectedGov?.code);

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

  function updateField<K extends keyof EducatorSurveyFormValues>(
    key: K,
    value: EducatorSurveyFormValues[K],
  ) {
    surveyForm.setFieldValue(key, value as never);
  }

  function toggleId(list: string[], id: string) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  function validateStep(index: number): string | null {
    switch (index) {
      case 0:
        try {
          validateSurveyPersonalFields({
            nameAsPerSsc: form.nameAsPerSsc,
            fatherOrHusbandName: form.fatherOrHusbandName,
            mobile: form.mobile,
            email: form.email,
            dateOfBirth: form.dateOfBirth,
          });
        } catch (e) {
          return e instanceof Error ? e.message : "Invalid personal details";
        }
        return null;
      case 1:
        return validateSurveyLocationFields({
          nationalityId: form.nationalityId,
          stateId: form.stateId,
          districtId: form.districtId,
          mandalId: form.mandalId,
          addressLine: form.addressLine,
          pincode: form.pincode,
        });
      case 2: {
        try {
          const normalized = normalizeYogaQualificationRows(
            form.yogaQualifications.map((r) => ({
              yogaQualificationLevelId: r.yogaQualificationLevelId,
              institutionName: r.institutionName,
              yearOfCompletion: Number(r.yearOfCompletion || 0),
              otherText: r.otherText || undefined,
            })),
          );
          validateYogaQualificationRowsStructure(normalized);
          for (const row of normalized) {
            const level = master?.yogaQualificationLevels.find(
              (q) => q.id === row.yogaQualificationLevelId,
            );
            if (level?.code === YOGA_QUALIFICATION_OTHERS_CODE && !row.otherText?.trim()) {
              return "Please specify your qualification (Others)";
            }
          }
        } catch (e) {
          return e instanceof Error ? e.message : "Invalid yoga qualifications";
        }
        return null;
      }
      case 3:
        return validateSurveyExperienceFields({
          yogaProfessionalTypeId: form.yogaProfessionalTypeId,
          currentlyTeaching: form.currentlyTeaching,
          experienceYears: form.experienceYears,
          experienceMonths: form.experienceMonths,
          experienceDays: form.experienceDays,
        });
      case 4:
        return form.employmentStatusId ? null : "Select employment status";
      case 5:
        return validateSurveyOpportunitiesFields({
          govWorkInterestId: form.govWorkInterestId,
          volunteerResponseId: form.volunteerResponseId,
          requiresGovExtras,
          languageIds: form.languageIds,
          employmentPreferenceIds: form.employmentPreferenceIds,
        });
      case 6:
        return validateSurveyChallengesFields({ challengeTypeIds: form.challengeTypeIds });
      case 7:
        return validateSurveyConsentFields({ consent: form.consent });
      default:
        return null;
    }
  }

  async function submit() {
    for (let i = 0; i < STEPS.length; i++) {
      const validationError = validateStep(i);
      if (validationError) {
        setError(validationError);
        setStep(i);
        return;
      }
    }

    setLoading(true);
    setError(null);

    const payload = {
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
      consent: form.consent,
    };

    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSuccessRef(data.survey?.referenceNumber ?? "Submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(index: number) {
    if (index > step) return;
    setError(null);
    setStep(index);
  }

  if (successRef) {
    return (
      <FormShell
        title="Survey submitted"
        subtitle="Your application has been received. You will receive an email to create your account after review."
      >
        <StepCard label="Reference number">
          <p className="text-lg font-semibold text-[#1B3D32]">{successRef}</p>
        </StepCard>
      </FormShell>
    );
  }

  if (!master) {
    return (
      <FormShell title="Yoga Educator Survey" subtitle="Loading form…">
        <StepCard>Please wait.</StepCard>
      </FormShell>
    );
  }

  return (
    <FormShell
      title="Yoga Educator Survey"
      subtitle="Personal details, education, Yoga qualifications, and experience. This is separate from APYEA membership."
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,220px)_1fr]">
        <StepperNav steps={[...STEPS]} current={step} onSelect={goToStep} />

        <div className="min-w-0 space-y-4">
          {error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          {step === 0 && (
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
                        name="gender"
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
          )}

          {step === 1 && (
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
                  onChange={(stateId) => {
                    surveyForm.setFieldValue("stateId", stateId);
                    surveyForm.setFieldValue("districtId", "");
                    surveyForm.setFieldValue("mandalId", "");
                  }}
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
                    surveyForm.setFieldValue("districtId", districtId);
                    surveyForm.setFieldValue("mandalId", "");
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
          )}

          {step === 2 && (
            <StepCard label="Yoga Qualification">
              <SurveyYogaQualificationsEditor
                rows={form.yogaQualifications}
                levels={master.yogaQualificationLevels}
                onChange={(yogaQualifications) => updateField("yogaQualifications", yogaQualifications)}
              />
            </StepCard>
          )}

          {step === 3 && (
            <StepCard label="Yoga experience">
              <FieldGrid>
                <SelectField
                  span
                  label="Type of yoga professional"
                  value={form.yogaProfessionalTypeId}
                  onChange={(yogaProfessionalTypeId) =>
                    updateField("yogaProfessionalTypeId", yogaProfessionalTypeId)
                  }
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
                    label="I am currently teaching yoga (experience applies)"
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
              </FieldGrid>
            </StepCard>
          )}

          {step === 4 && (
            <StepCard label="Current employment">
              <FieldGrid>
                <SelectField
                  span
                  label="Employment status"
                  value={form.employmentStatusId}
                  onChange={(employmentStatusId) =>
                    updateField("employmentStatusId", employmentStatusId)
                  }
                >
                  {master.employmentStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {labelOf(s)}
                    </option>
                  ))}
                </SelectField>
              </FieldGrid>
            </StepCard>
          )}

          {step === 5 && (
            <StepCard label="Opportunities">
              <FieldGrid>
                <FormField span label={SURVEY_GOV_TEACHER_QUESTION_LABEL}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {master.govWorkInterestOptions.map((o) => (
                      <RadioRow
                        key={o.id}
                        name="gov"
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
                        name="volunteer"
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
          )}

          {step === 6 && (
            <StepCard label="Challenges">
              <FieldGrid>
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
              </FieldGrid>
            </StepCard>
          )}

          {step === 7 && (
            <StepCard label="Declaration">
              <FieldGrid>
                <FormField span>
                  <CheckboxRow
                    checked={form.consent}
                    onChange={(v) => updateField("consent", v)}
                    label="I declare that the information given is true and I agree to share it with APYEA for Government representation."
                  />
                </FormField>
              </FieldGrid>
            </StepCard>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 ? (
              <SecondaryButton type="button" className="flex-1" onClick={back} disabled={loading}>
                Back
              </SecondaryButton>
            ) : (
              <div className="flex-1" />
            )}
            {step < STEPS.length - 1 ? (
              <PrimaryButton type="button" className="flex-1" onClick={next}>
                Continue
              </PrimaryButton>
            ) : (
              <PrimaryButton type="button" className="flex-1" onClick={submit} disabled={loading}>
                {loading ? "Submitting…" : "Submit survey"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </FormShell>
  );
}
