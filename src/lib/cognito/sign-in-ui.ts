import type { CognitoUsernameType } from "./config";

/** Client-visible sign-in mode (set `NEXT_PUBLIC_COGNITO_USERNAME_TYPE` to match server). */
export function publicUsernameType(): CognitoUsernameType {
  const value = process.env.NEXT_PUBLIC_COGNITO_USERNAME_TYPE?.trim().toLowerCase();
  return value === "email" ? "email" : "phone";
}
