import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/request-auth";
import { adminGetUser } from "@/lib/cognito/client";
import { syncUserFromCognito } from "@/lib/users/sync-user";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { sub, username } = auth.payload;
  const cognitoUsername = username ?? sub;

  try {
    const cognitoUser = await adminGetUser(cognitoUsername);
    const email =
      cognitoUser.UserAttributes?.find((a) => a.Name === "email")?.Value ??
      "";
    const name =
      cognitoUser.UserAttributes?.find((a) => a.Name === "name")?.Value ??
      null;

    const user = await syncUserFromCognito({
      cognitoSub: sub,
      email,
      name,
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/users/me", err);
    return NextResponse.json(
      { error: "Failed to load user profile" },
      { status: 500 },
    );
  }
}
