import {
  addressLineError,
  ageError,
  amountPaidError,
  emailError,
  firstValidationError,
  indianMobileError,
  paymentDateError,
  paymentReferenceError,
  personNameError,
  requiredSelectError,
  throwIfValidationError,
} from "@/lib/validation";
import {
  normalizeYogaQualificationRows,
  validateYogaQualificationRowsStructure,
} from "@/lib/yoga-qualifications";
import { validateTeacherInterest } from "@/lib/forms/teacher-interest";
import { prisma } from "@/lib/db";
import type { PaymentMethod } from "@prisma/client";
import type { MembershipApplicationSubmitInput } from "@/lib/membership/application-payload";

export async function validateMembershipApplicationInput(
  body: MembershipApplicationSubmitInput,
): Promise<MembershipApplicationSubmitInput> {
  throwIfValidationError(
    firstValidationError(
      personNameError(body.fullName, "Full name"),
      indianMobileError(body.mobile),
      emailError(body.email),
      ageError(body.age),
      requiredSelectError(body.stateId, "state"),
      requiredSelectError(body.districtId, "district"),
      requiredSelectError(body.mandalId, "mandal"),
      addressLineError(body.addressLine),
      paymentReferenceError(body.paymentReference),
      paymentDateError(body.paymentDate),
      amountPaidError(body.amountPaid),
    ),
  );

  if (!body.consent) {
    throw new Error("Declaration consent is required");
  }

  const yogaQualifications = normalizeYogaQualificationRows(body.yogaQualifications);
  validateYogaQualificationRowsStructure(yogaQualifications);

  const govOptions = await prisma.govWorkInterestOption.findMany({
    select: { id: true, code: true },
  });
  const codeById = (id: string) => govOptions.find((o) => o.id === id)?.code;
  throwIfValidationError(validateTeacherInterest(body.teacherInterest, codeById));

  if (body.subscriptionPlanId) {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: body.subscriptionPlanId, isActive: true, basis: "MEMBERSHIP" },
    });
    if (!plan) throw new Error("Selected subscription category is not available");
  }

  return { ...body, yogaQualifications, paymentMethod: "ONLINE" as PaymentMethod };
}

/** Client-side: returns first error message or null. */
export function membershipApplicationFormError(
  input: Omit<MembershipApplicationSubmitInput, "consent"> & { consent: boolean },
  options?: { hasPhoto?: boolean; hasIdentityProof?: boolean },
): string | null {
  const err = firstValidationError(
    personNameError(input.fullName, "Full name"),
    indianMobileError(input.mobile),
    emailError(input.email),
    ageError(input.age),
    requiredSelectError(input.stateId, "state"),
    requiredSelectError(input.districtId, "district"),
    requiredSelectError(input.mandalId, "mandal"),
    addressLineError(input.addressLine),
    paymentReferenceError(input.paymentReference),
    paymentDateError(input.paymentDate),
    amountPaidError(input.amountPaid),
  );
  if (err) return err;
  if (!input.consent) return "Please accept the declaration";
  if (options?.hasPhoto === false) return "Photograph is required";
  if (options?.hasIdentityProof === false) return "Identity proof is required";
  return null;
}
