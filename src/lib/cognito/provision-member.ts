import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@/lib/db";
import { adminCreateUser, adminGetUser } from "@/lib/cognito/client";
import { cognitoUsername } from "@/lib/cognito/username";
import { syncUserFromCognito } from "@/lib/users/sync-user";

function cognitoSubFromAttributes(
  attributes: { Name?: string; Value?: string }[] | undefined,
) {
  return attributes?.find((a) => a.Name === "sub")?.Value ?? null;
}

/**
 * Creates (or reuses) a Cognito user for an approved member and links Member.userId → User.
 */
export async function provisionMemberCognitoUser(input: {
  memberId: string;
  email: string;
  mobile: string;
  fullName: string;
  sendInvite?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const username = cognitoUsername({ email, mobile: input.mobile });
  let sub: string;

  try {
    const created = await adminCreateUser({
      email,
      mobile: input.mobile,
      name: input.fullName,
      suppressInviteEmail: input.sendInvite === false,
    });
    sub = cognitoSubFromAttributes(created.User?.Attributes) ?? "";
    if (!sub && created.User?.Username) {
      const fetched = await adminGetUser(created.User.Username);
      sub = cognitoSubFromAttributes(fetched.UserAttributes) ?? "";
    }
  } catch (err) {
    if (err instanceof UsernameExistsException) {
      const existing = await adminGetUser(username);
      sub = cognitoSubFromAttributes(existing.UserAttributes) ?? "";
    } else {
      throw err;
    }
  }

  if (!sub) {
    throw new Error("Could not resolve Cognito user id (sub)");
  }

  const user = await syncUserFromCognito({
    cognitoSub: sub,
    email,
    name: input.fullName,
  });

  await prisma.member.update({
    where: { id: input.memberId },
    data: { userId: user.id },
  });

  return { user, cognitoSub: sub };
}
