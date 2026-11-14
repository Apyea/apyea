import { MasterDataManager } from "@/components/admin/MasterDataManager";

export default function AdminMasterPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-zinc-950/50">
        Public admin (no auth) — manage lookup tables used by the registration form.
      </p>
      <MasterDataManager />
    </div>
  );
}
