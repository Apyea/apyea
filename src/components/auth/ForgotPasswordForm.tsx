"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { publicUsernameType } from "@/lib/cognito/sign-in-ui";
import { PrimaryButton, SecondaryButton, TextField } from "@/components/ui/form-primitives";

const usePhoneSignIn = publicUsernameType() === "phone";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessage(
        data.message ??
          (usePhoneSignIn
            ? "If an account exists, a reset code has been sent by SMS."
            : "If an account exists, a reset code has been sent to your email."),
      );
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={step === "request" ? "Forgot password" : "Reset password"}
      subtitle={
        step === "request"
          ? usePhoneSignIn
            ? "Enter your membership mobile number. We will send a verification code by SMS."
            : "Enter your membership email. We will send a verification code."
          : usePhoneSignIn
            ? "Enter the SMS code and choose a new password."
            : "Enter the code from your email and choose a new password."
      }
      footer={
        <Link href="/login" className="font-medium text-[#2F4F3A] hover:underline">
          Back to sign in
        </Link>
      }
    >
      {message ? (
        <div className="rounded-xl bg-[#E8F0EA] px-3 py-2 text-sm text-[#1B3D32]">{message}</div>
      ) : null}
      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {step === "request" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <TextField
            label={usePhoneSignIn ? "Mobile (10 digits)" : "Email"}
            type={usePhoneSignIn ? "tel" : "email"}
            autoComplete={usePhoneSignIn ? "tel" : "email"}
            inputMode={usePhoneSignIn ? "numeric" : undefined}
            required
            value={username}
            onChange={(e) =>
              setUsername(
                usePhoneSignIn
                  ? e.target.value.replace(/\D/g, "").slice(0, 10)
                  : e.target.value,
              )
            }
          />
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset code"}
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={confirmReset} className="space-y-4">
          <TextField
            label="Verification code"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </PrimaryButton>
          <SecondaryButton type="button" className="w-full" onClick={() => setStep("request")}>
            Use a different email
          </SecondaryButton>
        </form>
      )}
    </AuthShell>
  );
}
