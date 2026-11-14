import { PublicFormPage } from "@/components/layout/PublicFormPage";
import { MembershipApplyForm } from "@/components/membership/MembershipApplyForm";

export const instant = false;

export default function MembershipApplyPage() {
  return (
    <PublicFormPage maxWidthClass="max-w-3xl">
      <MembershipApplyForm />
    </PublicFormPage>
  );
}