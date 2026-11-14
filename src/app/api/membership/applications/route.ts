import { NextRequest, NextResponse } from "next/server";
import { PaymentMethod, Prisma } from "@prisma/client";
import { parsePaymentMethod } from "@/lib/finance/labels";
import { prisma } from "@/lib/db";
import {
  type MembershipApplicationSubmitInput,
  resolveMembershipYogaQualifications,
} from "@/lib/membership/application-payload";
import { savePrivateUpload } from "@/lib/uploads/save-file";
import { getAdminSetting } from "@/lib/membership/settings";
import { generateMembershipApplicationReference } from "@/lib/membership/references";
import { queueEmailLog } from "@/lib/membership/workflow";
import { validateMembershipApplicationInput } from "@/lib/membership/validate-application";

function parsePayload(raw: unknown): MembershipApplicationSubmitInput {
  return validateMembershipApplicationInput(raw as MembershipApplicationSubmitInput);
}

async function storeUploadedFile(file: File, folder: string) {
  const saved = await savePrivateUpload(folder, file);
  return prisma.storedFile.create({
    data: {
      storageKey: saved.storageKey,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      byteSize: saved.byteSize,
      checksumSha256: saved.checksumSha256,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const open = await getAdminSetting("membershipApplicationOpen", true);
    if (!open) {
      return NextResponse.json({ error: "Membership applications are closed" }, { status: 403 });
    }

    const form = await request.formData();
    const json = form.get("data");
    if (typeof json !== "string") {
      return NextResponse.json({ error: "Missing data field" }, { status: 400 });
    }
    const parsed = parsePayload(JSON.parse(json));
    const qualifications = await resolveMembershipYogaQualifications(parsed);

    const photo = form.get("photo");
    const identityProof = form.get("identityProof");
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ error: "Photograph is required" }, { status: 400 });
    }
    if (!(identityProof instanceof File) || identityProof.size === 0) {
      return NextResponse.json({ error: "Identity proof is required" }, { status: 400 });
    }

    const privacyNoticeVersion = await getAdminSetting("privacyNoticeVersion", "2026-01");
    const applicationReference = await generateMembershipApplicationReference();
    const now = new Date();

    const [photoFile, identityFile] = await Promise.all([
      storeUploadedFile(photo, "membership/photos"),
      storeUploadedFile(identityProof, "membership/identity"),
    ]);

    const application = await prisma.membershipApplication.create({
      data: {
        applicationReference,
        fullName: parsed.fullName.trim(),
        age: parsed.age,
        mobile: parsed.mobile,
        email: parsed.email.trim().toLowerCase(),
        stateId: parsed.stateId,
        districtId: parsed.districtId,
        mandalId: parsed.mandalId,
        addressLine: parsed.addressLine.trim(),
        highestYogaQualificationLevelId: qualifications.highestYogaQualificationLevelId,
        instituteName: qualifications.instituteName.trim(),
        yearOfPassing: qualifications.yearOfPassing,
        highestYogaQualificationOtherText: qualifications.highestYogaQualificationOtherText,
        photoFileId: photoFile.id,
        identityProofFileId: identityFile.id,
        paymentReference: parsed.paymentReference.trim(),
        paymentDate: new Date(parsed.paymentDate),
        amountPaid: new Prisma.Decimal(parsed.amountPaid),
        paymentMethod:
          typeof parsed.paymentMethod === "string"
            ? (parsePaymentMethod(parsed.paymentMethod) ?? PaymentMethod.ONLINE)
            : (parsed.paymentMethod ?? PaymentMethod.ONLINE),
        declarationConsentAt: now,
        privacyNoticeVersion: String(privacyNoticeVersion),
        educatorSurveyId: parsed.educatorSurveyId || null,
        submittedAt: now,
        yogaQualifications: {
          create: qualifications.yogaQualifications.map((q, i) => ({
            yogaQualificationLevelId: q.yogaQualificationLevelId,
            otherText: q.otherText?.trim() || null,
            institutionName: q.institutionName,
            yearOfCompletion: q.yearOfCompletion,
            sortOrder: i,
          })),
        },
      },
    });

    await queueEmailLog(parsed.email, "MEMBERSHIP_APPLICATION_SUBMITTED", {
      membershipApplicationId: application.id,
    });

    return NextResponse.json(
      {
        message: "Membership application submitted. APYEA will verify your details and payment.",
        application: {
          id: application.id,
          applicationReference: application.applicationReference,
          applicationStatus: application.applicationStatus,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Application failed";
    console.error("POST /api/membership/applications", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
