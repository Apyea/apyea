import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoConfig } from "./config";
import { cognitoSecretHash, withSecretHash } from "./secret-hash";

const client = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
});

function clientId() {
  return cognitoConfig.clientId();
}

export type SignInResult =
  | { kind: "tokens"; tokens: AuthenticationResultType }
  | {
      kind: "new_password_required";
      session: string;
      username: string;
      requiredAttributes: string[];
    };

function parseChallengeStringList(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function userAttributesChallengeResponses(attrs: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(attrs).map(([name, value]) => [
      `userAttributes.${name}`,
      value,
    ]),
  );
}

export async function signInWithPassword(
  username: string,
  password: string,
): Promise<SignInResult> {
  const response = await client.send(
    new InitiateAuthCommand({
      ClientId: clientId(),
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: withSecretHash(username, {
        USERNAME: username,
        PASSWORD: password,
      }),
    }),
  );

  if (response.ChallengeName === "NEW_PASSWORD_REQUIRED" && response.Session) {
    const requiredAttributes = parseChallengeStringList(
      response.ChallengeParameters?.requiredAttributes,
    );
    return {
      kind: "new_password_required",
      session: response.Session,
      username,
      requiredAttributes,
    };
  }

  if (!response.AuthenticationResult?.AccessToken) {
    throw new Error("Sign-in did not return tokens");
  }

  return { kind: "tokens", tokens: response.AuthenticationResult };
}

export async function completeNewPasswordChallenge(input: {
  username: string;
  newPassword: string;
  session: string;
  userAttributes?: Record<string, string>;
}): Promise<AuthenticationResultType> {
  const response = await client.send(
    new RespondToAuthChallengeCommand({
      ClientId: clientId(),
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: input.session,
      ChallengeResponses: withSecretHash(input.username, {
        USERNAME: input.username,
        NEW_PASSWORD: input.newPassword,
        ...userAttributesChallengeResponses(input.userAttributes ?? {}),
      }),
    }),
  );

  if (!response.AuthenticationResult?.AccessToken) {
    throw new Error("Password change did not return tokens");
  }

  return response.AuthenticationResult;
}

export async function requestForgotPassword(username: string) {
  await client.send(
    new ForgotPasswordCommand({
      ClientId: clientId(),
      Username: username,
      SecretHash: cognitoSecretHash(username),
    }),
  );
}

export async function refreshAccessToken(input: {
  cognitoUsername: string;
  refreshToken: string;
}): Promise<AuthenticationResultType> {
  const response = await client.send(
    new InitiateAuthCommand({
      ClientId: clientId(),
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: withSecretHash(input.cognitoUsername, {
        REFRESH_TOKEN: input.refreshToken,
      }),
    }),
  );

  if (!response.AuthenticationResult?.AccessToken) {
    throw new Error("Refresh did not return an access token");
  }

  return {
    ...response.AuthenticationResult,
    RefreshToken: response.AuthenticationResult.RefreshToken ?? input.refreshToken,
  };
}

export async function confirmForgotPassword(input: {
  username: string;
  code: string;
  newPassword: string;
}) {
  await client.send(
    new ConfirmForgotPasswordCommand({
      ClientId: clientId(),
      Username: input.username,
      ConfirmationCode: input.code,
      Password: input.newPassword,
      SecretHash: cognitoSecretHash(input.username),
    }),
  );
}
