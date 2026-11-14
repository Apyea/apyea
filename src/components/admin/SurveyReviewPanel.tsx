"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SurveyAdminEditForm, type SurveyEditSource } from "@/components/admin/SurveyAdminEditForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailReviewSkeleton } from "@/components/ui/skeleton";
import {
  PrimaryButton,
  SecondaryButton,
  StepCard,
} from "@/components/ui/form-primitives";
import { SURVEY_GOV_LANGUAGE_QUESTION_LABEL, SURVEY_GOV_TEACHER_QUESTION_LABEL, SURVEY_VOLUNTEER_QUESTION_LABEL } from "@/lib/survey/copy";

type Named = { id?: string; name?: string; label?: string; code?: string };

type SurveyDetail = SurveyEditSource & {
  id: string;
  referenceNumber: string;
  submissionStatus: string;
  reviewStatus: string;
  consentGivenAt: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  gender?: Named | null;
  nationality?: Named | null;
  state?: Named | null;
  district?: Named | null;
  mandal?: Named | null;
  highestYogaQualificationLevel?: Named | null;
  yogaProfessionalType?: Named | null;
  employmentStatus?: Named | null;
  govWorkInterest?: Named | null;
  volunteerResponse?: Named | null;
  languages?: { language: Named; otherLanguageText: string | null }[];
  employmentPreferences?: { preferenceType: Named }[];
  challenges?: { challengeType: Named }[];
};

function labelOf(item?: Named | null) {
  return item?.label ?? item?.name ?? "—";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function DetailRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1 ${fullWidth ? "md:col-span-2" : ""}`}>
      <dt className="text-xs font-medium text-[#5F7A66]">{label}</dt>
      <dd className="text-sm text-[#1E2E24]">{value}</dd>
    </div>
  );
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <StepCard label={title}>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</dl>
      </StepCard>
    </div>
  );
}

export function SurveyReviewPanel({ surveyId }: { surveyId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<SurveyDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/surveys/${id}`);
    const data = await res.json();
    setDetail(data.survey ?? null);
  }, []);

  useEffect(() => {
    void loadDetail(surveyId);
  }, [surveyId, loadDetail]);

  async function reviewRegistration(decision: "APPROVED" | "REJECTED") {
    if (!detail) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/surveys/${detail.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Review failed");
      setDetail(data.survey);
      setMessage(`Survey ${decision.toLowerCase()}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Review failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSurvey() {
    if (!detail) return;
    setDeleteLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/surveys/${detail.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      router.push("/admin/surveys");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed");
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!detail) {
    return <DetailReviewSkeleton />;
  }

  const experience =
    detail.experienceYears != null ||
    detail.experienceMonths != null ||
    detail.experienceDays != null
      ? `${detail.experienceYears ?? 0}y ${detail.experienceMonths ?? 0}m ${detail.experienceDays ?? 0}d`
      : "Not provided";

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete survey?"
        tone="danger"
        confirmLabel="Delete permanently"
        loading={deleteLoading}
        onConfirm={deleteSurvey}
        description={
          detail ? (
            <>
              Permanently delete survey <strong className="text-[#1E2E24]">{detail.referenceNumber}</strong>{" "}
              ({detail.nameAsPerSsc})? This cannot be undone.
            </>
          ) : null
        }
      />
      <Link href="/admin/surveys" className="text-sm font-medium text-[#2F4F3A] hover:underline">
        ← All surveys
      </Link>
      {message ? (
        <div className="rounded-xl bg-[#E8EFE9] px-3 py-2 text-sm text-[#1B3D32]">{message}</div>
      ) : null}

      {editing ? (
        <SurveyAdminEditForm
          surveyId={detail.id}
          source={detail}
          onCancel={() => setEditing(false)}
          onSaved={(survey) => {
            setDetail(survey as SurveyDetail);
            setEditing(false);
            setMessage("Survey updated");
          }}
        />
      ) : (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
        <div className="grid gap-4 lg:grid-cols-2">
          <DetailSection title="Personal details">
            <DetailRow label="Name (as per SSC)" value={detail.nameAsPerSsc} />
            <DetailRow label="Father / husband name" value={detail.fatherOrHusbandName} />
            <DetailRow label="Gender" value={labelOf(detail.gender)} />
            <DetailRow label="Date of birth" value={formatDate(detail.dateOfBirth)} />
            <DetailRow label="Mobile" value={detail.mobile} />
            <DetailRow label="Email" value={detail.email} />
          </DetailSection>

          <DetailSection title="Location">
            <DetailRow label="Nationality" value={labelOf(detail.nationality)} />
            <DetailRow label="State" value={labelOf(detail.state)} />
            <DetailRow label="District" value={labelOf(detail.district)} />
            <DetailRow label="Mandal" value={labelOf(detail.mandal)} />
            <DetailRow label="Pincode" value={detail.pincode ?? "—"} />
            <DetailRow label="Address" value={detail.addressLine} fullWidth />
          </DetailSection>

          <DetailSection title="Qualification & experience">
            <DetailRow
              label="Highest yoga qualification"
              value={labelOf(detail.highestYogaQualificationLevel)}
            />
            <DetailRow
              label="Yoga qualifications"
              fullWidth
              value={
                detail.yogaQualifications?.length ? (
                  <ul className="list-inside list-disc space-y-1">
                    {detail.yogaQualifications.map((q, i) => (
                      <li key={`${q.yogaQualificationLevelId}-${q.yearOfCompletion}-${i}`}>
                        {labelOf(q.yogaQualificationLevel)}{" "}
                        {q.otherText ? `(${q.otherText}) ` : ""}
                        — {q.institutionName} ({q.yearOfCompletion})
                      </li>
                    ))}
                  </ul>
                ) : detail.highestYogaQualificationLevel ? (
                  <span>
                    {labelOf(detail.highestYogaQualificationLevel)}
                    {detail.highestYogaQualificationOtherText
                      ? ` (${detail.highestYogaQualificationOtherText})`
                      : ""}{" "}
                    — {detail.yogaQualificationInstitutionName?.trim() || "—"} (
                    {detail.yogaQualificationYearOfCompletion || "—"})
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow label="Professional type" value={labelOf(detail.yogaProfessionalType)} />
            <DetailRow label="Experience" value={experience} />
          </DetailSection>

          <DetailSection title="Employment & opportunities">
            <DetailRow label="Employment status" value={labelOf(detail.employmentStatus)} />
            <DetailRow label={SURVEY_GOV_TEACHER_QUESTION_LABEL} value={labelOf(detail.govWorkInterest)} />
            <DetailRow label={SURVEY_VOLUNTEER_QUESTION_LABEL} value={labelOf(detail.volunteerResponse)} />
            <DetailRow
              label={SURVEY_GOV_LANGUAGE_QUESTION_LABEL}
              fullWidth
              value={
                detail.languages?.length ? (
                  <ul className="list-inside list-disc">
                    {detail.languages.map((l, i) => (
                      <li key={l.language.id ?? i}>
                        {labelOf(l.language)}
                        {l.otherLanguageText ? ` — ${l.otherLanguageText}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              label="Employment preferences"
              fullWidth
              value={
                detail.employmentPreferences?.length ? (
                  <ul className="list-inside list-disc">
                    {detail.employmentPreferences.map((p, i) => (
                      <li key={p.preferenceType.id ?? i}>{labelOf(p.preferenceType)}</li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )
              }
            />
          </DetailSection>

          <DetailSection title="Challenges reported" className="lg:col-span-2">
            <DetailRow
              label="Selected challenges"
              fullWidth
              value={
                detail.challenges?.length ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {detail.challenges.map((c, i) => (
                      <li key={c.challengeType.id ?? i} className="text-sm text-[#1E2E24]">
                        {labelOf(c.challengeType)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )
              }
            />
          </DetailSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <StepCard label={detail.referenceNumber}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <DetailRow label="Review status" value={detail.reviewStatus} />
              <DetailRow label="Submitted at" value={formatDateTime(detail.submittedAt)} />
              <DetailRow label="Consent at" value={formatDateTime(detail.consentGivenAt)} />
              <DetailRow label="Created at" value={formatDateTime(detail.createdAt)} />
              <DetailRow label="Updated at" value={formatDateTime(detail.updatedAt)} />
            </dl>
          </StepCard>

          <StepCard label="Admin actions">
            <div className="flex flex-col gap-2">
              <SecondaryButton
                type="button"
                disabled={loading}
                className="w-full"
                onClick={() => {
                  setMessage(null);
                  setEditing(true);
                }}
              >
                Edit survey details
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={loading}
                className="w-full px-5"
                onClick={() => reviewRegistration("APPROVED")}
              >
                Approve survey
              </PrimaryButton>
              <SecondaryButton
                type="button"
                disabled={loading}
                className="w-full"
                onClick={() => reviewRegistration("REJECTED")}
              >
                Reject
              </SecondaryButton>
              <SecondaryButton
                type="button"
                disabled={loading || deleteLoading}
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                Delete survey
              </SecondaryButton>
            </div>
          </StepCard>
        </aside>
      </div>
      )}
    </div>
  );
}
