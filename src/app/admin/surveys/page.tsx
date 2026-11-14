import { SurveysTable } from "@/components/admin/SurveysTable";

export default function AdminSurveysPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-[#5F7A66]">
        Yoga Educator Survey responses — search, filter, and mark internal review status. Membership
        is managed separately under Membership applications.
      </p>
      <SurveysTable />
    </div>
  );
}
