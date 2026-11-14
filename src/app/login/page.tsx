import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { AuthFormSkeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full flex-col bg-[#FAF7F2]">
          <AppTopBar />
          <div className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:py-12">
            <AuthFormSkeleton />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
