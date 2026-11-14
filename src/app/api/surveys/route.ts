import { NextRequest, NextResponse } from "next/server";
import { SurveyReviewStatus, SurveySubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { educatorSurveyDetailInclude } from "@/lib/survey/includes";
import { generateSurveyReferenceNumber } from "@/lib/survey/reference-number";
import {
  buildSurveyCreateNested,
  govWorkRequiresExtras,
  parseSurveyPayload,
  resolveSurveyYogaQualifications,
  surveyYogaQualificationScalars,
  validateGovExtras,
} from "@/lib/survey/survey-payload";

export async function POST(request: NextRequest) {
  try {
    const payload = await resolveSurveyYogaQualifications(
      parseSurveyPayload(await request.json(), { requireConsent: true }),
    );

    const requiresGovExtras = await govWorkRequiresExtras(payload.govWorkInterestId);
    validateGovExtras(payload, requiresGovExtras);

    const referenceNumber = await generateSurveyReferenceNumber();
    const now = new Date();
    const nested = buildSurveyCreateNested(payload, requiresGovExtras);

    const survey = await prisma.educatorSurvey.create({
      data: {
        referenceNumber,
        nameAsPerSsc: payload.nameAsPerSsc.trim(),
        fatherOrHusbandName: payload.fatherOrHusbandName.trim(),
        genderId: payload.genderId || null,
        mobile: payload.mobile,
        email: payload.email.trim().toLowerCase(),
        dateOfBirth: new Date(payload.dateOfBirth),
        nationalityId: payload.nationalityId,
        stateId: payload.stateId,
        districtId: payload.districtId,
        mandalId: payload.mandalId,
        addressLine: payload.addressLine.trim(),
        pincode: payload.pincode?.trim() || null,
        highestYogaQualificationLevelId: payload.highestYogaQualificationLevelId,
        ...surveyYogaQualificationScalars(payload),
        yogaProfessionalTypeId: payload.yogaProfessionalTypeId,
        experienceYears: payload.experienceYears ?? null,
        experienceMonths: payload.experienceMonths ?? null,
        experienceDays: payload.experienceDays ?? null,
        employmentStatusId: payload.employmentStatusId,
        govWorkInterestId: payload.govWorkInterestId,
        volunteerResponseId: payload.volunteerResponseId,
        consentGivenAt: now,
        submittedAt: now,
        submissionStatus: SurveySubmissionStatus.SUBMITTED,
        reviewStatus: SurveyReviewStatus.NOT_STARTED,
        ...nested,
      },
    });

    const full = await prisma.educatorSurvey.findUnique({
      where: { id: survey.id },
      include: educatorSurveyDetailInclude,
    });

    return NextResponse.json(
      {
        message: "Yoga Educator Survey submitted. Thank you.",
        survey: full,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Survey submission failed";
    console.error("POST /api/surveys", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? "20"), 100);

  try {
    const items = await prisma.educatorSurvey.findMany({
      where: email ? { email: email.toLowerCase() } : undefined,
      orderBy: { submittedAt: "desc" },
      take: limit,
      select: {
        id: true,
        referenceNumber: true,
        nameAsPerSsc: true,
        email: true,
        mobile: true,
        submissionStatus: true,
        reviewStatus: true,
        submittedAt: true,
      },
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/surveys", err);
    return NextResponse.json({ error: "Failed to list surveys" }, { status: 500 });
  }
}
