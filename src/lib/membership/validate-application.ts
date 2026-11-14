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
import { parsePaymentMethod } from "@/lib/finance/labels";
import type { MembershipApplicationSubmitInput } from "@/lib/membership/application-payload";

export function validateMembershipApplicationInput(
  body: MembershipApplicationSubmitInput,
): MembershipApplicationSubmitInput {
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

  const paymentMethod = parsePaymentMethod(body.paymentMethod) ?? "ONLINE";

  return { ...body, yogaQualifications, paymentMethod };
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
