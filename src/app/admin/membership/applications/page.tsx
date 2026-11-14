import { MembershipApplicationsTable } from "@/components/admin/membership/MembershipApplicationsTable";

export default function AdminMembershipApplicationsPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-[#5F7A66]">
        Review membership applications: verify qualification documents and payment, then approve to
        create a member record and membership number.
      </p>
      <MembershipApplicationsTable />
    </div>
  );
}
