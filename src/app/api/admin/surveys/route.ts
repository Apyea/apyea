import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { prisma } from "@/lib/db";

const SORTABLE_FIELDS = {
  submittedAt: "submittedAt",
  createdAt: "createdAt",
  referenceNumber: "referenceNumber",
  nameAsPerSsc: "nameAsPerSsc",
  email: "email",
  mobile: "mobile",
  reviewStatus: "reviewStatus",
  submissionStatus: "submissionStatus",
} as const;

type SortField = keyof typeof SORTABLE_FIELDS;

function parseSortField(value: string | null): SortField {
  if (value && value in SORTABLE_FIELDS) {
    return value as SortField;
  }
  return "submittedAt";
}

function optionalQueryId(sp: URLSearchParams, key: string) {
  const value = sp.get(key)?.trim();
  return value || undefined;
}

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  const sp = request.nextUrl.searchParams;
  const reviewStatus = sp.get("reviewStatus") ?? sp.get("documentReviewStatus");
  const districtId = optionalQueryId(sp, "districtId");
  const highestYogaQualificationLevelId = optionalQueryId(sp, "highestYogaQualificationLevelId");
  const yogaProfessionalTypeId = optionalQueryId(sp, "yogaProfessionalTypeId");
  const employmentStatusId = optionalQueryId(sp, "employmentStatusId");
  const govWorkInterestId = optionalQueryId(sp, "govWorkInterestId");
  const volunteerResponseId = optionalQueryId(sp, "volunteerResponseId");
  const languageId = optionalQueryId(sp, "languageId");
  const q = sp.get("q")?.trim() || "";
  const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
  const pageSize = Math.min(Math.max(1, Number(sp.get("pageSize") ?? "20") || 20), 100);
  const sortBy = parseSortField(sp.get("sortBy"));
  const sortOrder = sp.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Prisma.EducatorSurveyWhereInput = {
    ...(reviewStatus ? { reviewStatus: reviewStatus as never } : {}),
    ...(districtId ? { districtId } : {}),
    ...(highestYogaQualificationLevelId ? { highestYogaQualificationLevelId } : {}),
    ...(yogaProfessionalTypeId ? { yogaProfessionalTypeId } : {}),
    ...(employmentStatusId ? { employmentStatusId } : {}),
    ...(govWorkInterestId ? { govWorkInterestId } : {}),
    ...(volunteerResponseId ? { volunteerResponseId } : {}),
    ...(languageId ? { languages: { some: { languageId } } } : {}),
    ...(q
      ? {
          OR: [
            { referenceNumber: { contains: q, mode: "insensitive" } },
            { nameAsPerSsc: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q } },
          ],
        }
      : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.educatorSurvey.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          referenceNumber: true,
          nameAsPerSsc: true,
          email: true,
          mobile: true,
          submissionStatus: true,
          reviewStatus: true,
          submittedAt: true,
          createdAt: true,
          updatedAt: true,
          state: { select: { name: true } },
          district: { select: { name: true } },
        },
      }),
      prisma.educatorSurvey.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return staffJson(gate, {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        sortBy,
        sortOrder,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/surveys", err);
    return staffJson(gate, { error: "Failed to list" }, { status: 500 });
  }
}
