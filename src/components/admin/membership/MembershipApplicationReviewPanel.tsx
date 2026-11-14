"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  StepCard,
  TextAreaField,
} from "@/components/ui/form-primitives";
import { DetailReviewSkeleton } from "@/components/ui/skeleton";
import {
  formatMembershipStatus,
  getAvailableMembershipAdminActions,
  MEMBERSHIP_ADMIN_ACTION_LABELS,
  membershipWorkflowHint,
  type MembershipAdminAction,
} from "@/lib/membership/admin-actions";

type ApplicationDetail = {
  id: string;
  applicationReference: string;
  fullName: string;
  age: number;
  mobile: string;
  email: string;
  addressLine: string;
  applicationStatus: string;
  paymentStatus: string;
  paymentReference: string;
  paymentDate: string;
  amountPaid: string;
  adminRemarks: string | null;
  state?: { name: string };
  district?: { name: string };
  mandal?: { name: string };
  highestYogaQualificationLevel?: { label: string };
  instituteName: string;
  yearOfPassing: number;
  highestYogaQualificationOtherText?: string | null;
  yogaQualifications?: {
    institutionName: string;
    yearOfCompletion: number;
    otherText: string | null;
    yogaQualificationLevel?: { label: string };
  }[];
  photoFile?: { storageKey: string };
  identityProofFile?: { storageKey: string };
  member?: { membershipNumber: string; membershipStatus: string } | null;
};

function fileUrl(storageKey: string) {
  return `/api/files/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export function MembershipApplicationReviewPanel({ applicationId }: { applicationId: string }) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/membership/applications/${applicationId}`);
    const data = await res.json();
    setDetail(data.application ?? null);
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (detail?.adminRemarks) setRemarks(detail.adminRemarks);
  }, [detail?.adminRemarks]);

  async function runAction(action: MembershipAdminAction) {
    if (action === "reject" && !remarks.trim()) {
      setMessage("Enter a rejection reason in admin remarks");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/membership/applications/${applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, remarks: remarks || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setDetail(data.application);
      setMessage(`Done: ${action.replaceAll("_", " ")}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  if (!detail) {
    return <DetailReviewSkeleton />;
  }

  const availableActions = getAvailableMembershipAdminActions({
    applicationStatus: detail.applicationStatus,
    paymentStatus: detail.paymentStatus,
    hasMember: Boolean(detail.member),
  });
  const workflowHint = membershipWorkflowHint({
    applicationStatus: detail.applicationStatus,
    paymentStatus: detail.paymentStatus,
    hasMember: Boolean(detail.member),
  });
  const primaryAction: MembershipAdminAction | undefined =
    availableActions.includes("approve")
      ? "approve"
      : availableActions.includes("mark_verified")
        ? "mark_verified"
        : availableActions.includes("verify_payment")
          ? "verify_payment"
          : undefined;

  return (
    <div className="space-y-4">
      <Link href="/admin/membership/applications" className="text-sm text-[#2F4F3A] hover:underline">
        ← Membership applications
      </Link>
      {message ? (
        <div className="rounded-xl bg-[#E8EFE9] px-3 py-2 text-sm">{message}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <StepCard label={detail.applicationReference}>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-[#5F7A66]">Name</dt>
                <dd>{detail.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#5F7A66]">Age</dt>
                <dd>{detail.age}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#5F7A66]">Email</dt>
                <dd>{detail.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#5F7A66]">Mobile</dt>
                <dd>{detail.mobile}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5F7A66]">Address</dt>
                <dd>
                  {[detail.addressLine, detail.mandal?.name, detail.district?.name, detail.state?.name]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5F7A66]">Highest yoga qualification</dt>
                <dd>{detail.highestYogaQualificationLevel?.label ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5F7A66]">Yoga qualifications</dt>
                <dd>
                  {detail.yogaQualifications?.length ? (
                    <ul className="list-inside list-disc space-y-1">
                      {detail.yogaQualifications.map((q, i) => (
                        <li key={i}>
                          {q.yogaQualificationLevel?.label ?? "—"}
                          {q.otherText ? ` (${q.otherText})` : ""} — {q.institutionName} (
                          {q.yearOfCompletion})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      {detail.highestYogaQualificationLevel?.label ?? "—"}
                      {detail.highestYogaQualificationOtherText
                        ? ` (${detail.highestYogaQualificationOtherText})`
                        : ""}{" "}
                      — {detail.instituteName} ({detail.yearOfPassing})
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </StepCard>

          <StepCard label="Payment">
            <p className="text-sm">
              Reference: <strong>{detail.paymentReference}</strong>
              <br />
              Date: {new Date(detail.paymentDate).toLocaleDateString("en-IN")} · Amount: ₹
              {detail.amountPaid}
            </p>
          </StepCard>

          <StepCard label="Documents">
            <ul className="space-y-2 text-sm">
              {detail.photoFile ? (
                <li>
                  <a className="text-[#2F4F3A] underline" href={fileUrl(detail.photoFile.storageKey)}>
                    Photograph
                  </a>
                </li>
              ) : null}
              {detail.identityProofFile ? (
                <li>
                  <a
                    className="text-[#2F4F3A] underline"
                    href={fileUrl(detail.identityProofFile.storageKey)}
                  >
                    Identity proof
                  </a>
                </li>
              ) : null}
            </ul>
          </StepCard>
        </div>

        <aside className="space-y-4">
          <StepCard label="Status">
            <p className="text-sm">
              Application:{" "}
              <span className="font-medium text-[#1B3D32]">
                {formatMembershipStatus(detail.applicationStatus)}
              </span>
            </p>
            <p className="text-sm">
              Payment:{" "}
              <span className="font-medium text-[#1B3D32]">
                {formatMembershipStatus(detail.paymentStatus)}
              </span>
            </p>
            {detail.member ? (
              <p className="mt-2 text-sm font-medium text-[#1B3D32]">
                Member {detail.member.membershipNumber} ({detail.member.membershipStatus})
              </p>
            ) : null}
            {detail.adminRemarks ? (
              <p className="mt-2 text-xs text-[#5F7A66]">{detail.adminRemarks}</p>
            ) : null}
          </StepCard>

          <StepCard label="Team verification">
            {availableActions.length > 0 ? (
              <>
                <TextAreaField
                  label="Admin remarks"
                  hint={
                    availableActions.includes("reject")
                      ? "Optional for payment verification; required if you reject"
                      : undefined
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <div className="mt-3 flex flex-col gap-2">
                  {availableActions.map((action) => {
                    const label = MEMBERSHIP_ADMIN_ACTION_LABELS[action];
                    if (action === primaryAction) {
                      return (
                        <PrimaryButton
                          key={action}
                          disabled={loading}
                          onClick={() => runAction(action)}
                        >
                          {label}
                        </PrimaryButton>
                      );
                    }
                    return (
                      <SecondaryButton
                        key={action}
                        disabled={loading}
                        className={action === "reject" ? "text-red-800 ring-red-200/80" : undefined}
                        onClick={() => runAction(action)}
                      >
                        {label}
                      </SecondaryButton>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#5F7A66]">No actions available for this application.</p>
            )}
            <p className="mt-3 text-xs text-[#5F7A66]">{workflowHint}</p>
          </StepCard>
        </aside>
      </div>
    </div>
  );
}
