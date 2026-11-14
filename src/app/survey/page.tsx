import { EducatorSurveyForm } from "@/components/survey/EducatorSurveyForm";

export const instant = false;

export default function SurveyPage() {
  return (
    <main className="min-h-full bg-[#FAF7F2] py-8">
      <div className="mx-auto w-[70%] min-w-[320px] max-w-5xl px-4">
        <EducatorSurveyForm />
      </div>
    </main>
  );
}
