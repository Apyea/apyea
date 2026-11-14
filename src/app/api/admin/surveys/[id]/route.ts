import { NextRequest, NextResponse } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { prisma } from "@/lib/db";
import { educatorSurveyDetailInclude } from "@/lib/survey/includes";
import {
  parseSurveyPayload,
  resolveSurveyYogaQualifications,
  updateEducatorSurveyFromPayload,
} from "@/lib/survey/survey-payload";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await params;
  try {
    const survey = await prisma.educatorSurvey.findUnique({
      where: { id },
      include: educatorSurveyDetailInclude,
    });
    if (!survey) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return staffJson(gate, { survey });
  } catch (err) {
    console.error("GET /api/admin/surveys/[id]", err);
    return staffJson(gate, { error: "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await params;
  try {
    const existing = await prisma.educatorSurvey.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const payload = await resolveSurveyYogaQualifications(
      parseSurveyPayload(await request.json(), { requireConsent: false }),
    );
    await updateEducatorSurveyFromPayload(id, payload);

    const survey = await prisma.educatorSurvey.findUnique({
      where: { id },
      include: educatorSurveyDetailInclude,
    });

    return staffJson(gate, { survey });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    console.error("PATCH /api/admin/surveys/[id]", err);
    return staffJson(gate, { error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await params;
  try {
    const existing = await prisma.educatorSurvey.findUnique({
      where: { id },
      select: { id: true, referenceNumber: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const linkedMembership = await prisma.membershipApplication.count({
      where: { educatorSurveyId: id },
    });
    if (linkedMembership > 0) {
      return NextResponse.json(
        {
          error:
            "This survey is linked to one or more membership applications. Unlink or remove those applications before deleting the survey.",
        },
        { status: 409 },
      );
    }

    await prisma.educatorSurvey.delete({ where: { id } });

    return staffJson(gate, {
      message: `Survey ${existing.referenceNumber} deleted.`,
    });
  } catch (err) {
    console.error("DELETE /api/admin/surveys/[id]", err);
    return staffJson(gate, { error: "Delete failed" }, { status: 500 });
  }
}
