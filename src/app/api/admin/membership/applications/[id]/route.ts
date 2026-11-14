import { NextRequest, NextResponse } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { prisma } from "@/lib/db";
import { membershipApplicationInclude } from "@/lib/membership/includes";
import { getAvailableMembershipAdminActions } from "@/lib/membership/admin-actions";
import {
  approveMembershipApplication,
  markMembershipVerified,
  rejectMembershipApplication,
  verifyMembershipPayment,
} from "@/lib/membership/workflow";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await params;
  try {
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: membershipApplicationInclude,
    });
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return staffJson(gate, { application });
  } catch (err) {
    console.error("GET /api/admin/membership/applications/[id]", err);
    return staffJson(gate, { error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await params;
  try {
    const body = await request.json();
    const action = body.action as string;
    const remarks = body.remarks as string | undefined;

    const existing = await prisma.membershipApplication.findUnique({
      where: { id },
      include: { member: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowed = getAvailableMembershipAdminActions({
      applicationStatus: existing.applicationStatus,
      paymentStatus: existing.paymentStatus,
      hasMember: Boolean(existing.member),
    });
    if (!allowed.includes(action as (typeof allowed)[number])) {
      return NextResponse.json(
        { error: "This action is not available for the current application status" },
        { status: 400 },
      );
    }

    switch (action) {
      case "verify_payment":
        await verifyMembershipPayment(id, undefined, remarks);
        break;
      case "mark_verified":
        await markMembershipVerified(id);
        break;
      case "approve":
        await approveMembershipApplication(id);
        break;
      case "reject":
        if (!remarks?.trim()) {
          return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
        }
        await rejectMembershipApplication(id, remarks.trim());
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: membershipApplicationInclude,
    });
    return staffJson(gate, { application });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    console.error("POST /api/admin/membership/applications/[id]", err);
    return staffJson(gate, { error: message }, { status: 400 });
  }
}
