import { cognitoConfig, type CognitoUsernameType } from "./config";

/** Cognito `Username` (and sign-in identifier) for the configured user pool. */
export function cognitoUsername(input: { email: string; mobile?: string | null }): string {
  if (cognitoConfig.usernameType() === "phone") {
    if (!input.mobile?.trim()) {
      throw new Error("Mobile number is required to create a Cognito user (phone username pool)");
    }
    return toE164IndianPhone(input.mobile);
  }
  return input.email.trim().toLowerCase();
}

/** Normalize what the user types at sign-in / forgot-password. */
export function normalizeSignInIdentifier(raw: string): string {
  const value = raw.trim();
  if (!value) return value;
  if (cognitoConfig.usernameType() === "phone") {
    return toE164IndianPhone(value);
  }
  return value.toLowerCase();
}

export function toE164IndianPhone(mobile: string): string {
  const compact = mobile.replace(/[\s-]/g, "");
  if (compact.startsWith("+")) {
    const digits = compact.slice(1).replace(/\D/g, "");
    if (digits.length < 10) throw new Error("Invalid phone number");
    return `+${digits}`;
  }
  const digits = compact.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  throw new Error("Enter a valid 10-digit Indian mobile number");
}

export function signInFieldLabel(type: CognitoUsernameType = cognitoConfig.usernameType()) {
  return type === "phone" ? "Mobile (10 digits)" : "Email";
}

export function signInFieldAutoComplete(
  type: CognitoUsernameType = cognitoConfig.usernameType(),
) {
  return type === "phone" ? "tel" : "email";
}
