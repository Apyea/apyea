import { createHmac } from "node:crypto";
import { cognitoConfig } from "./config";

/** Required for app clients that have a client secret. */
export function cognitoSecretHash(username: string): string | undefined {
  const secret = cognitoConfig.clientSecret;
  if (!secret) return undefined;
  return createHmac("sha256", secret)
    .update(username + cognitoConfig.clientId())
    .digest("base64");
}

export function withSecretHash(
  username: string,
  params: Record<string, string>,
): Record<string, string> {
  const hash = cognitoSecretHash(username);
  if (!hash) return params;
  return { ...params, SECRET_HASH: hash };
}
