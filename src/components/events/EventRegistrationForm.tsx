"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicSiteChrome } from "@/components/team/PublicSiteChrome";
import {
  CheckboxRow,
  FormShell,
  PrimaryButton,
  StepCard,
  TextAreaField,
  TextField,
} from "@/components/ui/form-primitives";
import {
  collectEventRegistrationFieldErrors,
  eventRegistrationFieldError,
  type EventRegistrationField,
} from "@/lib/events/validate-registration";
import {
  EMPTY_TEACHER_INTEREST,
  YogaTeacherInterestSection,
} from "@/components/forms/YogaTeacherInterestSection";
import { validateTeacherInterest } from "@/lib/forms/teacher-interest";
import { resolveRegistrationFee } from "@/lib/events/fees";

type EventDetail = {
  id: string;
  title: string;
  code: string;
  defaultFee: number | null;
  memberFee: number | null;
  nonMemberFee: number | null;
  eventDate: string | null;
  venue: string | null;
};

type SessionMember = {
  fullName: string;
  email: string;
  mobile: string;
};

type FormState = {
  fullName: string;
  email: string;
  mobile: string;
  addressLine: string;
  paymentReference: string;
  paymentDate: string;
  amountPaid: string;
  consent: boolean;
  teacherInterest: typeof EMPTY_TEACHER_INTEREST;
};

function defaultForm(fee: string): FormState {
  return {
    fullName: "",
    email: "",
    mobile: "",
    addressLine: "",
    paymentReference: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    amountPaid: fee,
    consent: false,
    teacherInterest: { ...EMPTY_TEACHER_INTEREST },
  };
}

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [form, setForm] = useState(defaultForm(""));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<EventRegistrationField | "consent", string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [signedInMember, setSignedInMember] = useState<SessionMember | null>(null);
  const [master, setMaster] = useState<{
    govWorkInterestOptions: { id: string; code?: string; label?: string }[];
    lectureLanguages: { id: string; code?: string; label?: string }[];
    employmentPreferenceTypes: { id: string; label?: string }[];
  } | null>(null);

  function touchField(field: EventRegistrationField, value: string) {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: eventRegistrationFieldError(field, value) ?? undefined,
    }));
  }

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [eventRes, sessionRes, masterRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch("/api/auth/session", { credentials: "include" }),
          fetch("/api/master"),
        ]);
        const eventData = await eventRes.json();
        if (!eventRes.ok) throw new Error(eventData.error ?? "Event not found");
        setEvent(eventData.event);
        const masterData = await masterRes.json();
        setMaster({
          govWorkInterestOptions: masterData.govWorkInterestOptions ?? [],
          lectureLanguages: masterData.lectureLanguages ?? [],
          employmentPreferenceTypes: masterData.employmentPreferenceTypes ?? [],
        });

        const memberFee = resolveRegistrationFee(eventData.event, true);
        const fee = memberFee != null ? String(memberFee) : "";
        setForm(defaultForm(fee));

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.member) {
            setSignedInMember(sessionData.member);
            setForm((f) => ({
              ...f,
              fullName: sessionData.member.fullName,
              email: sessionData.member.email,
              mobile: sessionData.member.mobile,
              amountPaid: fee || f.amountPaid,
            }));
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    if (!signedInMember) {
      setError("Sign in as an APYEA member to register");
      setSubmitting(false);
      return;
    }
  const teacherErr = validateTeacherInterest(
      form.teacherInterest,
      (id) => master?.govWorkInterestOptions.find((o) => o.id === id)?.code,
    );
    if (teacherErr) {
      setError(teacherErr);
      setSubmitting(false);
      return;
    }

    const errors = collectEventRegistrationFieldErrors(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0] ?? "Please fix the highlighted fields");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/events/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId, ...form, teacherInterest: form.teacherInterest }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setSuccessRef(data.registration.registrationReference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const memberFeeValue = event ? resolveRegistrationFee(event, true) : null;

  let body: React.ReactNode;

  if (loading) {
    body = <p className="px-5 py-16 text-sm text-[#5F7A66]">Loading…</p>;
  } else if (!event) {
    body = (
      <div className="mx-auto max-w-lg px-5 py-16">
        <p className="text-sm text-red-600">{error ?? "Event not available"}</p>
        <Link href="/events" className="mt-4 inline-block text-sm font-medium text-[#2F4F3A]">
          ← All programmes
        </Link>
      </div>
    );
  } else if (successRef) {
    body = (
      <div className="mx-auto max-w-lg px-5 py-16">
        <FormShell title="Registration received" subtitle={`Reference: ${successRef}`}>
          <p className="text-sm text-[#5F7A66]">
            We will verify your payment and confirm your registration by email.
          </p>
          <Link href="/events" className="mt-6 inline-block text-sm font-medium text-[#2F4F3A]">
            Back to programmes
          </Link>
        </FormShell>
      </div>
    );
  } else {
    body = (
      <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
        <Link href="/events" className="text-sm font-medium text-[#2F4F3A] hover:underline">
          ← All programmes
        </Link>
        <FormShell title={event.title} subtitle={`Event code: ${event.code}`}>
          {signedInMember ? (
            <p className="mb-4 rounded-xl bg-[#E8EFE9] px-3 py-2 text-sm text-[#1B3D32]">
              Signed in as member — your profile details are pre-filled.
            </p>
          ) : (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <Link
                href={`/login?redirect=/events/${eventId}/register`}
                className="font-semibold text-[#2F4F3A] underline"
              >
                Sign in as an APYEA member
              </Link>{" "}
              to register for this programme.
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : null}
            <StepCard label="Participant">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Full name"
                  required
                  name="fullName"
                  className="sm:col-span-2"
                  value={form.fullName}
                  error={fieldErrors.fullName}
                  onChange={(e) => {
                    const fullName = e.target.value;
                    setForm({ ...form, fullName });
                    if (fieldErrors.fullName) touchField("fullName", fullName);
                  }}
                  onBlur={(e) => touchField("fullName", e.target.value)}
                />
                <TextField
                  label="Email"
                  type="email"
                  required
                  name="email"
                  autoComplete="email"
                  className="sm:col-span-2"
                  value={form.email}
                  error={fieldErrors.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    setForm({ ...form, email });
                    if (fieldErrors.email) touchField("email", email);
                  }}
                  onBlur={(e) => touchField("email", e.target.value)}
                />
                <TextField
                  label="Mobile"
                  required
                  name="mobile"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="sm:col-span-2"
                  value={form.mobile}
                  error={fieldErrors.mobile}
                  onChange={(e) => {
                    const mobile = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm({ ...form, mobile });
                    if (fieldErrors.mobile) touchField("mobile", mobile);
                  }}
                  onBlur={(e) => touchField("mobile", e.target.value)}
                />
                <TextAreaField
                  label="Address"
                  required
                  name="addressLine"
                  className="sm:col-span-2"
                  value={form.addressLine}
                  error={fieldErrors.addressLine}
                  onChange={(e) => {
                    const addressLine = e.target.value;
                    setForm({ ...form, addressLine });
                    if (fieldErrors.addressLine) touchField("addressLine", addressLine);
                  }}
                  onBlur={(e) => touchField("addressLine", e.target.value)}
                  rows={2}
                />
              </div>
            </StepCard>
            {master && signedInMember ? (
              <StepCard label="Yoga teaching interests">
                <YogaTeacherInterestSection
                  value={form.teacherInterest}
                  onChange={(teacherInterest) => setForm({ ...form, teacherInterest })}
                  govWorkInterestOptions={master.govWorkInterestOptions}
                  lectureLanguages={master.lectureLanguages}
                  employmentPreferenceTypes={master.employmentPreferenceTypes}
                />
              </StepCard>
            ) : null}
            <StepCard label="Programme payment">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Payment reference (UPI / transaction ID)"
                  required
                  name="paymentReference"
                  className="sm:col-span-2"
                  value={form.paymentReference}
                  error={fieldErrors.paymentReference}
                  onChange={(e) => {
                    const paymentReference = e.target.value;
                    setForm({ ...form, paymentReference });
                    if (fieldErrors.paymentReference) touchField("paymentReference", paymentReference);
                  }}
                  onBlur={(e) => touchField("paymentReference", e.target.value)}
                />
                <TextField
                  label="Payment date"
                  type="date"
                  required
                  name="paymentDate"
                  value={form.paymentDate}
                  error={fieldErrors.paymentDate}
                  onChange={(e) => {
                    const paymentDate = e.target.value;
                    setForm({ ...form, paymentDate });
                    if (fieldErrors.paymentDate) touchField("paymentDate", paymentDate);
                  }}
                  onBlur={(e) => touchField("paymentDate", e.target.value)}
                />
                <TextField
                  label="Amount paid (₹)"
                  required
                  name="amountPaid"
                  inputMode="decimal"
                  value={form.amountPaid}
                  error={fieldErrors.amountPaid}
                  onChange={(e) => {
                    const amountPaid = e.target.value;
                    setForm({ ...form, amountPaid });
                    if (fieldErrors.amountPaid) touchField("amountPaid", amountPaid);
                  }}
                  onBlur={(e) => touchField("amountPaid", e.target.value)}
                  readOnly={memberFeeValue != null}
                />
              </div>
            </StepCard>
            <div>
              <CheckboxRow
                label="I confirm the payment details above are correct and authorize APYEA to verify them."
                checked={form.consent}
                onChange={(consent) => {
                  setForm({ ...form, consent });
                  if (fieldErrors.consent) {
                    setFieldErrors((prev) => ({ ...prev, consent: undefined }));
                  }
                }}
              />
              {fieldErrors.consent ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.consent}</p>
              ) : null}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-full border border-[#1E2E24]/15 bg-white px-4 py-2.5 text-center text-sm font-medium text-[#1E2E24] hover:bg-[#FAF7F2] sm:w-auto"
              >
                Cancel
              </Link>
              <PrimaryButton
                type="submit"
                disabled={submitting || !signedInMember}
                className="sm:w-auto"
              >
                {submitting ? "Submitting…" : "Submit registration"}
              </PrimaryButton>
            </div>
          </form>
        </FormShell>
      </div>
    );
  }

  return <PublicSiteChrome>{body}</PublicSiteChrome>;
}