import { MembershipApplyForm } from "@/components/membership/MembershipApplyForm";

export const instant = false;

export default function MembershipApplyPage() {
  return (
    <main className="min-h-full bg-[#FAF7F2] py-8">
      <div className="mx-auto max-w-3xl px-4">
        <MembershipApplyForm />
      </div>
    </main>
  );
}
