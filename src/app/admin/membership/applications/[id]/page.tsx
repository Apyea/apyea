import { MembershipApplicationReviewPanel } from "@/components/admin/membership/MembershipApplicationReviewPanel";

export const instant = false;

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminMembershipApplicationPage({ params }: PageProps) {
  const { id } = await params;
  return <MembershipApplicationReviewPanel applicationId={id} />;
}
