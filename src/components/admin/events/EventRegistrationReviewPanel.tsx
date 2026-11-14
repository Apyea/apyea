"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth/admin-fetch";
import {
  EVENT_REGISTRATION_ADMIN_ACTION_LABELS,
  eventRegistrationWorkflowHint,
  formatEventRegistrationStatus,
  getAvailableEventRegistrationActions,
  type EventRegistrationAdminAction,
} from "@/lib/events/admin-actions";
import {
  PrimaryButton,
  SecondaryButton,
  StepCard,
  TextAreaField,
} from "@/components/ui/form-primitives";
import { DetailReviewSkeleton } from "@/components/ui/skeleton";

type Detail = {
  id: string;
  registrationReference: string;
  fullName: string;
  email: string;
  mobile: string;
  addressLine: string;
  paymentReference: string;
  paymentDate: string;
  amountPaid: string;
  paymentMethod: string;
  registrationStatus: string;
  paymentStatus: string;
  adminRemarks: string | null;
  event: { title: string; code: string; venue: string | null; eventDate: string | null };
  member: { membershipNumber: string } | null;
  paymentRecords: { receiptNumber: string; verificationStatus: string }[];
};

export function EventRegistrationReviewPanel({ registrationId }: { registrationId: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch(`/api/admin/events/registrations/${registrationId}`);
    const data = await res.json();
    setDetail(data.registration ?? null);
  }, [registrationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (detail?.adminRemarks) setRemarks(detail.adminRemarks);
  }, [detail?.adminRemarks]);

  async function runAction(action: EventRegistrationAdminAction) {
    if (action === "reject" && !remarks.trim()) {
      setMessage("Enter remarks before rejecting");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminFetch(`/api/admin/events/registrations/${registrationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, remarks: remarks || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setDetail(data.registration);
      setMessage(EVENT_REGISTRATION_ADMIN_ACTION_LABELS[action]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  if (!detail) return <DetailReviewSkeleton />;

  const actions = getAvailableEventRegistrationActions({
    registrationStatus: detail.registrationStatus,
    paymentStatus: detail.paymentStatus,
  });
  const hint = eventRegistrationWorkflowHint({
    registrationStatus: detail.registrationStatus,
    paymentStatus: detail.paymentStatus,
  });

  return (
    <div className="space-y-4">
      <Link href="/admin/events/registrations" className="text-sm font-medium text-[#2F4F3A]">
        ← All registrations
      </Link>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-[#1E2E24]/8">
        <p className="font-mono text-xs text-[#5F7A66]">{detail.registrationReference}</p>
        <h1 className="mt-1 text-xl font-semibold text-[#1B3D32]">{detail.fullName}</h1>
        <p className="mt-1 text-sm text-[#5F7A66]">
          {detail.event.title} ({detail.event.code})
        </p>
        <p className="mt-4 text-sm text-[#4A5F50]">{hint}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StepCard label="Participant">
          <dl className="space-y-2 text-sm">
            <DetailRow label="Email" value={detail.email} />
            <DetailRow label="Mobile" value={detail.mobile} />
            <DetailRow label="Address" value={detail.addressLine} />
            <DetailRow
              label="Member"
              value={detail.member?.membershipNumber ?? "Public / non-member"}
            />
            <DetailRow
              label="Registration"
              value={formatEventRegistrationStatus(detail.registrationStatus)}
            />
            <DetailRow
              label="Payment status"
              value={formatEventRegistrationStatus(detail.paymentStatus)}
            />
          </dl>
        </StepCard>
        <StepCard label="Payment">
          <dl className="space-y-2 text-sm">
            <DetailRow label="Reference" value={detail.paymentReference} />
            <DetailRow
              label="Date"
              value={new Date(detail.paymentDate).toLocaleDateString("en-IN")}
            />
            <DetailRow label="Amount" value={`₹${detail.amountPaid}`} />
            {detail.paymentRecords[0] ? (
              <DetailRow
                label="Receipt"
                value={`${detail.paymentRecords[0].receiptNumber} (${detail.paymentRecords[0].verificationStatus})`}
              />
            ) : null}
          </dl>
        </StepCard>
      </div>

      <StepCard label="Admin">
        <TextAreaField
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
        />
        {message ? <p className="text-sm text-[#2F4F3A]">{message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <PrimaryButton
              key={action}
              type="button"
              disabled={loading}
              className="sm:w-auto"
              onClick={() => void runAction(action)}
            >
              {EVENT_REGISTRATION_ADMIN_ACTION_LABELS[action]}
            </PrimaryButton>
          ))}
          <SecondaryButton
            type="button"
            className="sm:w-auto"
            disabled={loading}
            onClick={() => void load()}
          >
            Refresh
          </SecondaryButton>
        </div>
      </StepCard>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#1E2E24]/6 py-1">
      <dt className="text-[#5F7A66]">{label}</dt>
      <dd className="text-right font-medium text-[#1E2E24]">{value}</dd>
    </div>
  );
}