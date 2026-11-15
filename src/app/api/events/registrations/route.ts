import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/request-auth";
import { submitEventRegistration } from "@/lib/events/submit-registration";
import { prisma } from "@/lib/db";
import { syncUserFromCognito } from "@/lib/users/sync-user";
import { adminGetUser } from "@/lib/cognito/client";
import type { EventRegistrationInput } from "@/lib/events/validate-registration";

async function optionalMemberContext(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return null;
  const { sub, username } = auth.payload;
  const cognitoUsername = username ?? sub;
  let email = "";
  try {
    const cognitoUser = await adminGetUser(cognitoUsername);
    email =
      cognitoUser.UserAttributes?.find((a) => a.Name === "email")?.Value?.trim().toLowerCase() ??
      "";
  } catch {
    return null;
  }
  if (!email) return null;
  const user = await syncUserFromCognito({ cognitoSub: sub, email, name: null });
  const member = await prisma.member.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  return { userId: user.id, memberId: member?.id };
}

export async function POST(request: NextRequest) {
  try {
    let body: EventRegistrationInput;
    try {
      body = (await request.json()) as EventRegistrationInput;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const memberCtx = await optionalMemberContext(request);
    if (!memberCtx?.memberId || !memberCtx.userId) {
      return NextResponse.json(
        { error: "Sign in as an APYEA member to register for programmes" },
        { status: 401 },
      );
    }
    const registration = await submitEventRegistration(body, {
      userId: memberCtx.userId,
      memberId: memberCtx.memberId,
    });

    return NextResponse.json(
      {
        message:
          "Registration submitted. APYEA will verify your payment and confirm your seat.",
        registration: {
          id: registration.id,
          registrationReference: registration.registrationReference,
          registrationStatus: registration.registrationStatus,
          paymentStatus: registration.paymentStatus,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/events/registrations", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 400 },
    );
  }
}