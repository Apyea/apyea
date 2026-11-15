import type { TeacherInterestPayload } from "@/lib/forms/teacher-interest";
import { validateTeacherInterest } from "@/lib/forms/teacher-interest";
import {
  addressLineError,
  amountPaidError,
  emailError,
  firstValidationError,
  indianMobileError,
  paymentDateError,
  paymentReferenceError,
  personNameError,
  requiredSelectError,
  throwIfValidationError,
} from "@/lib/validation";

export type EventRegistrationInput = {
  eventId: string;
  fullName: string;
  email: string;
  mobile: string;
  addressLine: string;
  paymentReference: string;
  paymentDate: string;
  amountPaid: string;
  consent: boolean;
  teacherInterest: TeacherInterestPayload;
};

export type EventRegistrationField = keyof Omit<EventRegistrationInput, "eventId" | "consent">;

export function eventRegistrationFieldError(
  field: EventRegistrationField,
  value: string,
): string | null {
  switch (field) {
    case "fullName":
      return personNameError(value, "Full name");
    case "email":
      return emailError(value);
    case "mobile":
      return indianMobileError(value);
    case "addressLine":
      return addressLineError(value);
    case "paymentReference":
      return paymentReferenceError(value);
    case "paymentDate":
      return paymentDateError(value);
    case "amountPaid":
      return amountPaidError(Number.parseFloat(value));
    default:
      return null;
  }
}

export function collectEventRegistrationFieldErrors(
  input: Omit<EventRegistrationInput, "eventId">,
): Partial<Record<EventRegistrationField | "consent", string>> {
  const errors: Partial<Record<EventRegistrationField | "consent", string>> = {};
  for (const field of [
    "fullName",
    "email",
    "mobile",
    "addressLine",
    "paymentReference",
    "paymentDate",
    "amountPaid",
  ] as const) {
    const msg = eventRegistrationFieldError(field, input[field]);
    if (msg) errors[field] = msg;
  }
  if (!input.consent) errors.consent = "You must agree to proceed";
  return errors;
}

export function validateEventRegistrationInput(
  input: EventRegistrationInput,
  options?: { govInterestCodeById?: (id: string) => string | undefined },
) {
  const amount = Number.parseFloat(input.amountPaid);
  throwIfValidationError(
    firstValidationError(
      requiredSelectError(input.eventId, "event"),
      personNameError(input.fullName, "Full name"),
      emailError(input.email),
      indianMobileError(input.mobile),
      addressLineError(input.addressLine),
      paymentReferenceError(input.paymentReference),
      paymentDateError(input.paymentDate),
      amountPaidError(amount),
      !input.consent ? "You must agree to proceed" : null,
      options?.govInterestCodeById
        ? validateTeacherInterest(input.teacherInterest, options.govInterestCodeById)
        : null,
    ),
  );

  return input;
}