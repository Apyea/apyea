/** Shared field validators — return `null` if valid, otherwise a user-facing message. */

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PINCODE_REGEX = /^\d{6}$/;

export const PERSON_NAME_MIN = 2;
export const PERSON_NAME_MAX = 120;
export const INSTITUTE_NAME_MAX = 200;
export const ADDRESS_MIN = 10;
export const ADDRESS_MAX = 500;
export const PAYMENT_REF_MIN = 4;
export const PAYMENT_REF_MAX = 80;
export const MEMBERSHIP_MIN_AGE = 18;
export const MEMBERSHIP_MAX_AGE = 100;
export const DOB_MIN_AGE = 18;
export const DOB_MAX_AGE = 100;

const PERSON_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;

export function throwIfValidationError(message: string | null): void {
  if (message) throw new Error(message);
}

export function firstValidationError(...checks: Array<string | null>): string | null {
  for (const msg of checks) {
    if (msg) return msg;
  }
  return null;
}

export function requiredTextError(value: string | undefined | null, label: string): string | null {
  if (!value?.trim()) return `${label} is required`;
  return null;
}

export function personNameError(
  value: string | undefined | null,
  label: string,
  options?: { min?: number; max?: number },
): string | null {
  const trimmed = value?.trim() ?? "";
  const min = options?.min ?? PERSON_NAME_MIN;
  const max = options?.max ?? PERSON_NAME_MAX;
  if (!trimmed) return `${label} is required`;
  if (trimmed.length < min) return `${label} must be at least ${min} characters`;
  if (trimmed.length > max) return `${label} must be at most ${max} characters`;
  if (!PERSON_NAME_REGEX.test(trimmed)) {
    return `${label} may only contain letters, spaces, and common punctuation`;
  }
  return null;
}

export function indianMobileError(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Mobile number is required";
  if (!INDIAN_MOBILE_REGEX.test(trimmed)) {
    return "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
  }
  return null;
}

export function emailError(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Email is required";
  if (trimmed.length > 254) return "Email is too long";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
  return null;
}

export function pincodeError(value: string | undefined | null, optional = true): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return optional ? null : "Pincode is required";
  if (!PINCODE_REGEX.test(trimmed)) return "Pincode must be 6 digits";
  return null;
}

function ageFromDateOfBirth(isoDate: string): number | null {
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function dateOfBirthError(
  isoDate: string | undefined | null,
  options?: { minAge?: number; maxAge?: number },
): string | null {
  if (!isoDate?.trim()) return "Date of birth is required";
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return "Enter a valid date of birth";
  if (dob > new Date()) return "Date of birth cannot be in the future";
  const age = ageFromDateOfBirth(isoDate);
  if (age == null) return "Enter a valid date of birth";
  const minAge = options?.minAge ?? DOB_MIN_AGE;
  const maxAge = options?.maxAge ?? DOB_MAX_AGE;
  if (age < minAge) return `You must be at least ${minAge} years old`;
  if (age > maxAge) return `Please check date of birth (maximum age ${maxAge})`;
  return null;
}

export function ageError(
  age: number,
  min = MEMBERSHIP_MIN_AGE,
  max = MEMBERSHIP_MAX_AGE,
): string | null {
  if (!Number.isFinite(age)) return "Enter a valid age";
  if (age < min) return `Age must be ${min} or above`;
  if (age > max) return `Age must be ${max} or below`;
  return null;
}

export function addressLineError(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Address is required";
  if (trimmed.length < ADDRESS_MIN) return `Address must be at least ${ADDRESS_MIN} characters`;
  if (trimmed.length > ADDRESS_MAX) return `Address must be at most ${ADDRESS_MAX} characters`;
  return null;
}

export function instituteNameError(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Name of institute is required";
  if (trimmed.length < 2) return "Name of institute must be at least 2 characters";
  if (trimmed.length > INSTITUTE_NAME_MAX) return "Name of institute is too long";
  return null;
}

export function requiredSelectError(value: string | undefined | null, label: string): string | null {
  if (!value?.trim()) return `Select ${label}`;
  return null;
}

export function paymentReferenceError(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Payment reference (UTR / transaction ID) is required";
  if (trimmed.length < PAYMENT_REF_MIN) {
    return `Payment reference must be at least ${PAYMENT_REF_MIN} characters`;
  }
  if (trimmed.length > PAYMENT_REF_MAX) return "Payment reference is too long";
  return null;
}

export function amountPaidError(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return "Enter a valid amount paid";
  if (value > 1_000_000) return "Amount paid seems too large — please check";
  return null;
}

export function paymentDateError(isoDate: string | undefined | null): string | null {
  if (!isoDate?.trim()) return "Payment date is required";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "Enter a valid payment date";
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d > today) return "Payment date cannot be in the future";
  return null;
}

export function experienceError(
  years: string,
  months: string,
  days: string,
  required: boolean,
): string | null {
  if (!required) return null;
  if (years === "" && months === "" && days === "") {
    return "Enter experience (years, months, or days)";
  }
  const y = years === "" ? 0 : Number(years);
  const mo = months === "" ? 0 : Number(months);
  const d = days === "" ? 0 : Number(days);
  if (![y, mo, d].every((n) => Number.isFinite(n) && n >= 0)) {
    return "Experience must be non-negative numbers";
  }
  if (mo > 11) return "Experience months must be 0–11";
  if (d > 31) return "Experience days must be 0–31";
  if (y > 80) return "Please check experience years";
  if (y === 0 && mo === 0 && d === 0) return "Enter at least one non-zero experience value";
  return null;
}

export function nonEmptySelectionError(ids: string[] | undefined, label: string): string | null {
  if (!ids?.length) return label;
  return null;
}
