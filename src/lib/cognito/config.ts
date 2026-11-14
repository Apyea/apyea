function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export type CognitoUsernameType = "phone" | "email";

/** Region encoded in the user pool id (e.g. `us-east-1_Abcd`). */
export function cognitoUserPoolRegion(): string {
  const poolId = requireEnv("COGNITO_USER_POOL_ID");
  const sep = poolId.indexOf("_");
  if (sep > 0) return poolId.slice(0, sep);
  return process.env.AWS_REGION ?? "us-east-1";
}

export const cognitoConfig = {
  /** Prefer the pool’s region so Admin/JWKS calls match the pool (not only AWS_REGION). */
  region: cognitoUserPoolRegion(),
  userPoolId: () => requireEnv("COGNITO_USER_POOL_ID"),
  clientId: () => requireEnv("COGNITO_CLIENT_ID"),
  clientSecret: process.env.COGNITO_CLIENT_SECRET,
  /** User pool sign-in: `phone` (E.164 username) or `email`. Default `phone`. */
  usernameType: (): CognitoUsernameType => {
    const value = process.env.COGNITO_USERNAME_TYPE?.trim().toLowerCase();
    return value === "email" ? "email" : "phone";
  },
  /** Cognito user-pool attribute name for gender (standard: `gender`). */
  genderAttributeName: () =>
    process.env.COGNITO_GENDER_ATTRIBUTE?.trim() || "gender",
  /** Value set on AdminCreateUser when gender is not supplied (required pools). */
  defaultGender: () =>
    process.env.COGNITO_DEFAULT_GENDER?.trim() || "unknown",
};
