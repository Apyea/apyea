import { PublicFormPage } from "@/components/layout/PublicFormPage";
import { EducatorSurveyForm } from "@/components/survey/EducatorSurveyForm";

export const instant = false;

export default function SurveyPage() {
  return (
    <PublicFormPage maxWidthClass="min-w-[320px] max-w-5xl w-[min(100%,70vw)] sm:w-full">
      <EducatorSurveyForm />
    </PublicFormPage>
  );
}