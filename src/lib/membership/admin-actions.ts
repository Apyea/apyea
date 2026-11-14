export type MembershipAdminAction = "verify_payment" | "mark_verified" | "approve" | "reject";

export const MEMBERSHIP_ADMIN_ACTION_LABELS: Record<MembershipAdminAction, string> = {
  verify_payment: "Verify payment",
  mark_verified: "Mark application verified",
  approve: "Approve membership",
  reject: "Reject application",
};

const TERMINAL_APPLICATION = new Set(["APPROVED", "REJECTED"]);

export function formatMembershipStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getAvailableMembershipAdminActions({
  applicationStatus,
  paymentStatus,
  hasMember,
}: {
  applicationStatus: string;
  paymentStatus: string;
  hasMember: boolean;
}): MembershipAdminAction[] {
  if (hasMember || TERMINAL_APPLICATION.has(applicationStatus)) {
    return [];
  }

  const actions: MembershipAdminAction[] = [];

  if (paymentStatus === "PENDING") {
    actions.push("verify_payment");
  }

  if (
    paymentStatus === "VERIFIED" &&
    applicationStatus !== "VERIFIED"
  ) {
    actions.push("mark_verified");
  }

  if (applicationStatus === "VERIFIED" && paymentStatus === "VERIFIED") {
    actions.push("approve");
  }

  actions.push("reject");

  return actions;
}

export function membershipWorkflowHint({
  applicationStatus,
  paymentStatus,
  hasMember,
}: {
  applicationStatus: string;
  paymentStatus: string;
  hasMember: boolean;
}): string {
  if (hasMember || applicationStatus === "APPROVED") {
    return "Membership is approved and an active member record exists.";
  }
  if (applicationStatus === "REJECTED") {
    return "This application was rejected. No further actions are available.";
  }
  if (paymentStatus === "REJECTED") {
    return "Payment was rejected. Reject the application or ask the applicant to resubmit.";
  }
  if (applicationStatus === "VERIFIED" && paymentStatus === "VERIFIED") {
    return "Information and payment are verified. Approve to issue a membership number.";
  }
  if (paymentStatus === "VERIFIED" && applicationStatus !== "VERIFIED") {
    return "Payment is verified. Complete document and qualification checks, then mark the application verified.";
  }
  if (paymentStatus === "PENDING") {
    return "Verify payment first, then review qualifications and documents before marking the application verified.";
  }
  return "Review payment proof, qualifications, and identity documents per APYEA workflow.";
}
