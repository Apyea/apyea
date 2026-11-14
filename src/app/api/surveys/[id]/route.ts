import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { educatorSurveyDetailInclude } from "@/lib/survey/includes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const survey = await prisma.educatorSurvey.findFirst({
      where: {
        OR: [{ id }, { referenceNumber: id }],
      },
      include: educatorSurveyDetailInclude,
    });
    if (!survey) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ survey });
  } catch (err) {
    console.error("GET /api/surveys/[id]", err);
    return NextResponse.json({ error: "Failed to load survey" }, { status: 500 });
  }
}
