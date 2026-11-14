export type EventRegistrationAdminAction = "verify_payment" | "reject" | "cancel";

export const EVENT_REGISTRATION_ADMIN_ACTION_LABELS: Record<
  EventRegistrationAdminAction,
  string
> = {
  verify_payment: "Verify payment & confirm",
  reject: "Reject registration",
  cancel: "Cancel registration",
};

const TERMINAL = new Set(["CONFIRMED", "REJECTED", "CANCELLED"]);

export function formatEventRegistrationStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getAvailableEventRegistrationActions({
  registrationStatus,
  paymentStatus,
}: {
  registrationStatus: string;
  paymentStatus: string;
}): EventRegistrationAdminAction[] {
  if (TERMINAL.has(registrationStatus)) {
    return registrationStatus === "CONFIRMED" ? ["cancel"] : [];
  }

  const actions: EventRegistrationAdminAction[] = [];
  if (paymentStatus === "PENDING") {
    actions.push("verify_payment");
  }
  actions.push("reject");
  return actions;
}

export function eventRegistrationWorkflowHint({
  registrationStatus,
  paymentStatus,
}: {
  registrationStatus: string;
  paymentStatus: string;
}): string {
  if (registrationStatus === "CONFIRMED") {
    return "Payment verified. Participant is confirmed for the event. Income appears under EVENT_FEE in finance reports.";
  }
  if (registrationStatus === "REJECTED") {
    return "This registration was rejected.";
  }
  if (registrationStatus === "CANCELLED") {
    return "This registration was cancelled.";
  }
  if (paymentStatus === "PENDING") {
    return "Verify payment against bank/UPI records, then confirm registration.";
  }
  return "Review participant details.";
}