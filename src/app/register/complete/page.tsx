import { PublicFormPage } from "@/components/layout/PublicFormPage";

export const instant = false;

export default function RegisterCompletePage() {
  return (
    <PublicFormPage maxWidthClass="max-w-lg">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-950/10">
        <h1 className="text-lg font-medium text-zinc-950">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-950/55">
          Complete Cognito sign-up using the email on your registration once account creation is
          enabled.
        </p>
        <p className="mt-4 text-xs text-zinc-950/45">
          Wire this page to your hosted sign-up flow when ready.
        </p>
      </div>
    </PublicFormPage>
  );
}