import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type AttributeType,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoConfig } from "./config";
import { cognitoUsername, toE164IndianPhone } from "./username";

const client = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
});

function poolId() {
  return cognitoConfig.userPoolId();
}

export async function adminCreateUser(input: {
  email: string;
  mobile?: string;
  name?: string;
  gender?: string;
  temporaryPassword?: string;
  /** When false, Cognito sends invite (SMS or email per pool). */
  suppressInviteEmail?: boolean;
}) {
  const username = cognitoUsername({ email: input.email, mobile: input.mobile });
  const usePhone = cognitoConfig.usernameType() === "phone";
  const phoneE164 = usePhone ? toE164IndianPhone(input.mobile!) : null;

  const attributes: AttributeType[] = [
    { Name: "email", Value: input.email.trim().toLowerCase() },
    { Name: "email_verified", Value: "true" },
  ];
  if (phoneE164) {
    attributes.push(
      { Name: "phone_number", Value: phoneE164 },
      { Name: "phone_number_verified", Value: "true" },
    );
  }
  if (input.name) {
    attributes.push({ Name: "name", Value: input.name });
  }
  const genderAttr = cognitoConfig.genderAttributeName();
  const gender =
    input.gender?.trim() || cognitoConfig.defaultGender();
  attributes.push({ Name: genderAttr, Value: gender });

  const command = new AdminCreateUserCommand({
    UserPoolId: poolId(),
    Username: username,
    UserAttributes: attributes,
    TemporaryPassword: input.temporaryPassword,
    DesiredDeliveryMediums: usePhone ? ["SMS"] : ["EMAIL"],
    MessageAction: input.suppressInviteEmail ? "SUPPRESS" : undefined,
  });

  return client.send(command);
}

export async function adminGetUser(username: string) {
  return client.send(
    new AdminGetUserCommand({
      UserPoolId: poolId(),
      Username: username,
    }),
  );
}

export async function adminUpdateUserAttributes(
  username: string,
  attributes: AttributeType[],
) {
  return client.send(
    new AdminUpdateUserAttributesCommand({
      UserPoolId: poolId(),
      Username: username,
      UserAttributes: attributes,
    }),
  );
}

export async function adminDeleteUser(username: string) {
  return client.send(
    new AdminDeleteUserCommand({
      UserPoolId: poolId(),
      Username: username,
    }),
  );
}

export async function listUsers(limit = 20, paginationToken?: string) {
  return client.send(
    new ListUsersCommand({
      UserPoolId: poolId(),
      Limit: limit,
      PaginationToken: paginationToken,
    }),
  );
}
