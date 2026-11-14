import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/request-auth";
import { adminGetUser } from "@/lib/cognito/client";
import { syncUserFromCognito } from "@/lib/users/sync-user";
import { prisma } from "@/lib/db";
import { getCognitoUsernameFromRequest, setAuthCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { sub, username } = auth.payload;
  const cognitoUsername =
    getCognitoUsernameFromRequest(request) ?? username ?? sub;

  try {
    const existing = await prisma.user.findUnique({ where: { cognitoSub: sub } });
    let email = existing?.email ?? "";
    let name = existing?.name ?? null;

    try {
      const cognitoUser = await adminGetUser(cognitoUsername);
      email =
        cognitoUser.UserAttributes?.find((a) => a.Name === "email")?.Value?.trim().toLowerCase() ??
        email;
      name = cognitoUser.UserAttributes?.find((a) => a.Name === "name")?.Value ?? name;
    } catch (lookupErr) {
      console.warn("GET /api/auth/session: adminGetUser failed, using database user", lookupErr);
    }

    if (!email) {
      return NextResponse.json(
        { error: "User profile not found. Contact support or run bootstrap:admins again." },
        { status: 404 },
      );
    }

    const user = await syncUserFromCognito({
      cognitoSub: sub,
      email,
      name,
    });

    const member = await prisma.member.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        membershipNumber: true,
        membershipStatus: true,
        membershipStartDate: true,
        membershipExpiryDate: true,
        fullName: true,
        email: true,
        mobile: true,
      },
    });

    const response = NextResponse.json({ user, member });
    if (auth.refreshedTokens) {
      setAuthCookies(response, auth.refreshedTokens, cognitoUsername);
    }
    return response;
  } catch (err) {
    console.error("GET /api/auth/session", err);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}
