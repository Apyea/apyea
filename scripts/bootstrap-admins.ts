/**
 * Create Cognito users and Postgres users with role ADMIN.
 *
 * Phone username pool (default):
 *   npm run bootstrap:admins -- 9876543210 admin@example.com
 *   (pairs: 10-digit mobile, then email — repeat for more admins)
 *
 * Email username pool (COGNITO_USERNAME_TYPE=email):
 *   npm run bootstrap:admins -- admin@example.com
 *
 * Requires: DATABASE_URL, COGNITO_*, AWS credentials.
 * Optional: ADMIN_BOOTSTRAP_PASSWORD — temp password (suppresses SMS/email invite).
 * Optional: COGNITO_DEFAULT_GENDER — required if user pool mandates gender (default `unknown`).
 */
import "dotenv/config";
import { prisma } from "../src/lib/db";
import { adminCreateUser, adminGetUser } from "../src/lib/cognito/client";
import { cognitoConfig } from "../src/lib/cognito/config";
import { cognitoUsername } from "../src/lib/cognito/username";
import { syncUserFromCognito } from "../src/lib/users/sync-user";
import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";

const args = process.argv.slice(2).filter(Boolean);
const usePhone = cognitoConfig.usernameType() === "phone";

async function provisionAdmin(email: string, mobile?: string) {
  const username = cognitoUsername({ email, mobile });
  const tempPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  let sub: string | undefined;

  try {
    const created = await adminCreateUser({
      email,
      mobile,
      temporaryPassword: tempPassword,
      suppressInviteEmail: Boolean(tempPassword),
    });
    sub = created.User?.Attributes?.find((a) => a.Name === "sub")?.Value;
    if (!sub && created.User?.Username) {
      const fetched = await adminGetUser(created.User.Username);
      sub = fetched.UserAttributes?.find((a) => a.Name === "sub")?.Value;
    }
    console.log(`Created Cognito user ${username}`);
  } catch (err) {
    if (err instanceof UsernameExistsException) {
      const existing = await adminGetUser(username);
      sub = existing.UserAttributes?.find((a) => a.Name === "sub")?.Value;
      console.log(`Cognito user already exists: ${username}`);
    } else {
      throw err;
    }
  }

  if (!sub) throw new Error(`Could not resolve sub for ${username}`);

  const user = await syncUserFromCognito({
    cognitoSub: sub,
    email: email.trim().toLowerCase(),
    role: "ADMIN",
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`Postgres user ${user.id} (${email}) → role ADMIN`);
}

async function main() {
  if (!args.length) {
    console.error(
      usePhone
        ? "Usage: npm run bootstrap:admins -- <10-digit-mobile> <email> [<mobile> <email> ...]"
        : "Usage: npm run bootstrap:admins -- <email> [<email> ...]",
    );
    process.exit(1);
  }

  if (usePhone) {
    if (args.length % 2 !== 0) {
      console.error("Phone pool: provide mobile and email as pairs (even number of arguments).");
      process.exit(1);
    }
    for (let i = 0; i < args.length; i += 2) {
      await provisionAdmin(args[i + 1], args[i]);
    }
  } else {
    for (const email of args) {
      await provisionAdmin(email);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
