import { CognitoJwtVerifier } from "aws-jwt-verify";
import { SimpleFetcher } from "aws-jwt-verify/https";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import { cognitoConfig } from "./config";

const JWKS_TIMEOUT_MS = Number(process.env.COGNITO_JWKS_TIMEOUT_MS ?? "15000");

let accessVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getAccessVerifier() {
  if (!accessVerifier) {
    const fetcher = new SimpleFetcher({
      defaultRequestOptions: {
        responseTimeout: JWKS_TIMEOUT_MS,
      },
    });
    accessVerifier = CognitoJwtVerifier.create(
      {
        userPoolId: cognitoConfig.userPoolId(),
        tokenUse: "access",
        clientId: cognitoConfig.clientId(),
      },
      {
        jwksCache: new SimpleJwksCache({ fetcher }),
      },
    );
  }
  return accessVerifier;
}

export type CognitoAccessPayload = {
  sub: string;
  username?: string;
  "cognito:groups"?: string[];
  token_use?: string;
  client_id?: string;
  exp?: number;
};

/**
 * Use right after InitiateAuth / RespondToAuthChallenge — token was just issued by Cognito (no JWKS fetch).
 */
export function decodeAccessTokenPayload(token: string): CognitoAccessPayload {
  const segment = token.split(".")[1];
  if (!segment) {
    throw new Error("Invalid access token");
  }
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const json = Buffer.from(padded, "base64").toString("utf8");
  const payload = JSON.parse(json) as CognitoAccessPayload;
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid access token payload");
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp != null && payload.exp < now - 60) {
    throw new Error("Access token expired");
  }
  if (payload.token_use && payload.token_use !== "access") {
    throw new Error("Expected access token");
  }
  const clientId = cognitoConfig.clientId();
  if (payload.client_id && payload.client_id !== clientId) {
    throw new Error("Access token client mismatch");
  }
  return payload;
}

export async function verifyAccessToken(token: string) {
  const payload = await getAccessVerifier().verify(token);
  return payload as CognitoAccessPayload;
}
