import { NextRequest, NextResponse } from "next/server";
import { SurveyReviewStatus } from "@prisma/client";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { prisma } from "@/lib/db";
import { educatorSurveyDetailInclude } from "@/lib/survey/includes";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const { id } = await params;

  try {
    const body = await request.json();
    const decision = body.decision as "APPROVED" | "REJECTED";
    if (!["APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const app = await prisma.educatorSurvey.findUnique({ where: { id } });
    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.educatorSurvey.update({
      where: { id },
      data: {
        reviewStatus:
          decision === "APPROVED" ? SurveyReviewStatus.APPROVED : SurveyReviewStatus.REJECTED,
      },
    });

    const survey = await prisma.educatorSurvey.findUnique({
      where: { id },
      include: educatorSurveyDetailInclude,
    });

    return staffJson(gate, { survey });
  } catch (err) {
    console.error("POST /api/admin/surveys/[id]/review", err);
    return staffJson(gate, { error: "Review failed" }, { status: 500 });
  }
}
