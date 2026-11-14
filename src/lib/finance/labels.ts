import { ExpenseCategory, PaymentCategory, PaymentMethod } from "@prisma/client";

export const PAYMENT_CATEGORY_LABELS: Record<PaymentCategory, string> = {
  MEMBERSHIP_FEE: "Membership fee",
  RENEWAL_FEE: "Renewal fee",
  DONATION: "Donation",
  PROGRAM_FEE: "Program fee",
  EVENT_FEE: "Event fee",
  SUBSCRIPTION_FEE: "Subscription fee",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: "Rent",
  CLOUD_CHARGES: "Cloud charges",
  PROGRAM_EXPENSE: "Program expense",
  STATIONARY: "Stationary",
  ADMINISTRATIVE: "Administrative",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  ONLINE: "Online / UPI",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank transfer",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "ONLINE",
  "CHEQUE",
  "BANK_TRANSFER",
];

export function parsePaymentMethod(value: string | undefined): PaymentMethod | null {
  const v = value?.trim().toUpperCase();
  if (v && PAYMENT_METHODS.includes(v as PaymentMethod)) {
    return v as PaymentMethod;
  }
  return null;
}
