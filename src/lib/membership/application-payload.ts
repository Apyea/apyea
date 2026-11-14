import type { PaymentMethod } from "@prisma/client";
import {
  resolveYogaQualificationRows,
  type YogaQualificationRowInput,
} from "@/lib/yoga-qualifications";

export type MembershipApplicationSubmitInput = {
  fullName: string;
  age: number;
  mobile: string;
  email: string;
  stateId: string;
  districtId: string;
  mandalId: string;
  addressLine: string;
  yogaQualifications: YogaQualificationRowInput[];
  paymentReference: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod?: PaymentMethod | string;
  consent: boolean;
  educatorSurveyId?: string;
};

export async function resolveMembershipYogaQualifications(body: {
  yogaQualifications?: YogaQualificationRowInput[];
}) {
  const resolved = await resolveYogaQualificationRows(body);
  return {
    yogaQualifications: resolved.yogaQualifications,
    highestYogaQualificationLevelId: resolved.highestYogaQualificationLevelId,
    instituteName: resolved.highestInstitutionName,
    yearOfPassing: resolved.highestYearOfCompletion,
    highestYogaQualificationOtherText: resolved.highestYogaQualificationOtherText,
  };
}
