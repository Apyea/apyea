import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicSiteChrome } from "@/components/team/PublicSiteChrome";
import { AuthFormSkeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PublicSiteChrome>
          <div className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:min-h-[calc(100dvh-4rem)] sm:py-12">
            <AuthFormSkeleton />
          </div>
        </PublicSiteChrome>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
