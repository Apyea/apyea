"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApyeaCheckboxField,
  ApyeaDateField,
  ApyeaSelectField,
  ApyeaTextField,
  fieldValidator,
  fieldValidatorBoolean,
  fieldValidatorNumber,
  useForm,
  useStore,
} from "@/components/ui/tanstack-form";
import {
  FieldGrid,
  FileField,
  FormShell,
  PrimaryButton,
  StepCard,
} from "@/components/ui/form-primitives";
import {
  emptyYogaQualificationRow,
  SurveyYogaQualificationsEditor,
  type YogaQualificationRow,
} from "@/components/survey/SurveyYogaQualificationsEditor";
import { membershipApplicationFormError } from "@/lib/membership/validate-application";
import {
  normalizeYogaQualificationRows,
  validateYogaQualificationRowsStructure,
  YOGA_QUALIFICATION_OTHERS_CODE,
} from "@/lib/yoga-qualifications";
import {
  addressLineError,
  ageError,
  amountPaidError,
  emailError,
  indianMobileError,
  paymentDateError,
  paymentReferenceError,
  personNameError,
  requiredSelectError,
} from "@/lib/validation";

type Lookup = { id: string; label?: string; name?: string; code?: string };

type MembershipFormValues = {
  fullName: string;
  age: string;
  mobile: string;
  email: string;
  stateId: string;
  districtId: string;
  mandalId: string;
  addressLine: string;
  yogaQualifications: YogaQualificationRow[];
  paymentReference: string;
  paymentDate: string;
  amountPaid: string;
  paymentMethod: string;
  consent: boolean;
};

function labelOf(item: Lookup) {
  return item.label ?? item.name ?? item.code ?? "";
}

const defaultValues: MembershipFormValues = {
  fullName: "",
  age: "",
  mobile: "",
  email: "",
  stateId: "",
  districtId: "",
  mandalId: "",
  addressLine: "",
  yogaQualifications: [emptyYogaQualificationRow()],
  paymentReference: "",
  paymentDate: "",
  amountPaid: "",
  paymentMethod: "ONLINE",
  consent: false,
};

export function MembershipApplyForm() {
  const [master, setMaster] = useState<{
    states: Lookup[];
    yogaQualificationLevels: Lookup[];
  } | null>(null);
  const [districts, setDistricts] = useState<Lookup[]>([]);
  const [mandals, setMandals] = useState<Lookup[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [identityProof, setIdentityProof] = useState<File | null>(null);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const formErr = membershipApplicationFormError(
        {
          ...value,
          age: Number(value.age),
          amountPaid: Number(value.amountPaid),
          yogaQualifications: [],
          consent: value.consent,
        },
        { hasPhoto: Boolean(photo), hasIdentityProof: Boolean(identityProof) },
      );
      if (formErr) {
        setSubmitError(formErr);
        return;
      }
      if (!photo || !identityProof) {
        setSubmitError("Photo and identity proof are required");
        return;
      }

      try {
        const yogaQualifications = normalizeYogaQualificationRows(
          value.yogaQualifications.map((r) => ({
            yogaQualificationLevelId: r.yogaQualificationLevelId,
            institutionName: r.institutionName,
            yearOfCompletion: Number(r.yearOfCompletion || 0),
            otherText: r.otherText || undefined,
          })),
        );
        validateYogaQualificationRowsStructure(yogaQualifications);
        for (const row of yogaQualifications) {
          const level = master?.yogaQualificationLevels.find(
            (q) => q.id === row.yogaQualificationLevelId,
          );
          if (level?.code === YOGA_QUALIFICATION_OTHERS_CODE && !row.otherText?.trim()) {
            setSubmitError("Please specify your qualification (Others)");
            return;
          }
        }

        setSubmitting(true);
        const data = {
          fullName: value.fullName,
          age: Number(value.age),
          mobile: value.mobile,
          email: value.email,
          stateId: value.stateId,
          districtId: value.districtId,
          mandalId: value.mandalId,
          addressLine: value.addressLine,
          yogaQualifications,
          paymentReference: value.paymentReference,
          paymentDate: value.paymentDate,
          amountPaid: Number(value.amountPaid),
          paymentMethod: value.paymentMethod,
          consent: true,
        };
        const body = new FormData();
        body.set("data", JSON.stringify(data));
        body.set("photo", photo);
        body.set("identityProof", identityProof);

        const res = await fetch("/api/membership/applications", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Submission failed");
        setSuccessRef(json.application?.applicationReference ?? "Submitted");
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Submission failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    void fetch("/api/master")
      .then((r) => r.json())
      .then((data) =>
        setMaster({
          states: data.states ?? [],
          yogaQualificationLevels: data.yogaQualificationLevels ?? [],
        }),
      );
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

  const stateId = useStore(form.store, (s) => s.values.stateId);
  const districtId = useStore(form.store, (s) => s.values.districtId);

  useEffect(() => {
    if (stateId) void loadDistricts(stateId);
    else {
      setDistricts([]);
      setMandals([]);
    }
  }, [stateId, loadDistricts]);

  useEffect(() => {
    if (districtId) void loadMandals(districtId);
    else setMandals([]);
  }, [districtId, loadMandals]);

  if (successRef) {
    return (
      <FormShell title="Application submitted" subtitle={`Reference: ${successRef}`}>
        <p className="text-sm text-[#5F7A66]">
          APYEA will verify your details and membership payment. Login
          credentials will be sent after approval (when email delivery is configured).
        </p>
      </FormShell>
    );
  }

  if (!master) {
    return (
      <FormShell title="Apply for APYEA Membership" subtitle="Loading…">
        <p className="text-sm text-[#5F7A66]">Please wait…</p>
      </FormShell>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FormShell
        title="Apply for APYEA Membership"
        subtitle="Separate from the Yoga Educator Survey. Submit personal details, documents, and payment proof."
      >
        {submitError ? (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
        ) : null}

        <StepCard label="Personal details">
          <FieldGrid>
            <ApyeaTextField
              formApi={form}
              name="fullName"
              span
              label="Full name (as per records)"
              required
              validators={{
                onBlur: fieldValidator((v) => personNameError(v, "Full name")),
              }}
            />
            <ApyeaTextField
              formApi={form}
              name="age"
              label="Age"
              required
              inputMode="numeric"
              validators={{
                onBlur: fieldValidatorNumber((v) => ageError(v)),
              }}
              sanitize={(raw) => raw.replace(/\D/g, "")}
            />
            <ApyeaTextField
              formApi={form}
              name="mobile"
              label="Mobile (10 digits)"
              required
              validators={{
                onBlur: fieldValidator((v) => indianMobileError(v)),
              }}
              sanitize={(raw) => raw.replace(/\D/g, "").slice(0, 10)}
            />
            <ApyeaTextField
              formApi={form}
              name="email"
              label="Email"
              required
              type="email"
              validators={{
                onBlur: fieldValidator((v) => emailError(v)),
              }}
            />
            <ApyeaSelectField
              formApi={form}
              name="stateId"
              label="State"
              validators={{
                onChange: fieldValidator((v) => requiredSelectError(v, "state")),
              }}
              onValueChange={(stateId) => {
                form.setFieldValue("districtId", "");
                form.setFieldValue("mandalId", "");
                if (stateId) void loadDistricts(stateId);
              }}
            >
              {master.states.map((s) => (
                <option key={s.id} value={s.id}>
                  {labelOf(s)}
                </option>
              ))}
            </ApyeaSelectField>
            <form.Subscribe selector={(s) => s.values.stateId}>
              {(stateId) => (
                <ApyeaSelectField
                  formApi={form}
                  name="districtId"
                  label="District"
                  disabled={!stateId}
                  validators={{
                    onChange: fieldValidator((v) => requiredSelectError(v, "district")),
                  }}
                  onValueChange={(districtId) => {
                    form.setFieldValue("mandalId", "");
                    if (districtId) void loadMandals(districtId);
                  }}
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {labelOf(d)}
                    </option>
                  ))}
                </ApyeaSelectField>
              )}
            </form.Subscribe>
            <form.Subscribe selector={(s) => s.values.districtId}>
              {(districtId) => (
                <ApyeaSelectField
                  formApi={form}
                  name="mandalId"
                  label="Mandal"
                  disabled={!districtId}
                  validators={{
                    onChange: fieldValidator((v) => requiredSelectError(v, "mandal")),
                  }}
                >
                  {mandals.map((m) => (
                    <option key={m.id} value={m.id}>
                      {labelOf(m)}
                    </option>
                  ))}
                </ApyeaSelectField>
              )}
            </form.Subscribe>
            <ApyeaTextField
              formApi={form}
              name="addressLine"
              span
              label="Address"
              required
              validators={{
                onBlur: fieldValidator((v) => addressLineError(v)),
              }}
            />
          </FieldGrid>
        </StepCard>

        <StepCard label="Yoga qualifications">
          <form.Subscribe selector={(s) => s.values.yogaQualifications}>
            {(rows) => (
              <SurveyYogaQualificationsEditor
                rows={rows}
                levels={master.yogaQualificationLevels}
                onChange={(yogaQualifications) =>
                  form.setFieldValue("yogaQualifications", yogaQualifications)
                }
              />
            )}
          </form.Subscribe>
        </StepCard>

        <StepCard label="Documents">
          <FieldGrid>
            <FileField
              label="Photograph"
              accept="image/*"
              required
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
            <FileField
              label="Identity proof"
              accept="image/*,application/pdf"
              required
              onChange={(e) => setIdentityProof(e.target.files?.[0] ?? null)}
            />
          </FieldGrid>
        </StepCard>

        <StepCard label="Membership payment">
          <FieldGrid>
            <ApyeaTextField
              formApi={form}
              name="paymentReference"
              label="Payment reference (UTR / transaction ID)"
              required
              validators={{
                onBlur: fieldValidator((v) => paymentReferenceError(v)),
              }}
            />
            <ApyeaDateField
              formApi={form}
              name="paymentDate"
              label="Payment date"
              max={new Date().toISOString().slice(0, 10)}
              validators={{
                onBlur: fieldValidator((v) => paymentDateError(v)),
              }}
            />
            <ApyeaTextField
              formApi={form}
              name="amountPaid"
              label="Amount paid (₹)"
              required
              inputMode="decimal"
              validators={{
                onBlur: fieldValidatorNumber((v) => amountPaidError(v)),
              }}
            />
            <ApyeaSelectField formApi={form} name="paymentMethod" label="Payment method">
              <option value="ONLINE">Online / UPI</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
            </ApyeaSelectField>
          </FieldGrid>
        </StepCard>

        <ApyeaCheckboxField
          formApi={form}
          name="consent"
          validators={{
            onChange: fieldValidatorBoolean((v) => (v ? null : "Please accept the declaration")),
          }}
        >
          I declare that the information provided is true and I accept the APYEA privacy notice.
        </ApyeaCheckboxField>

        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <PrimaryButton
              type="submit"
              disabled={submitting || !canSubmit}
              className="mt-4"
            >
              {submitting ? "Submitting…" : "Submit membership application"}
            </PrimaryButton>
          )}
        </form.Subscribe>
      </FormShell>
    </form>
  );
}
