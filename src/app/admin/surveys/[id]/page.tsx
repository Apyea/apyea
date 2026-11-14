import { SurveyReviewPanel } from "@/components/admin/SurveyReviewPanel";

export const instant = false;

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminSurveyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-7xl">
      <SurveyReviewPanel surveyId={id} />
    </div>
  );
}
