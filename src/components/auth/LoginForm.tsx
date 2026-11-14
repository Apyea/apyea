"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { publicUsernameType } from "@/lib/cognito/sign-in-ui";
import { parseResponseJson } from "@/lib/auth/parse-response-json";
import { PrimaryButton, TextField } from "@/components/ui/form-primitives";

const signInType = publicUsernameType();
const usePhoneSignIn = signInType === "phone";

export function LoginForm({ redirectTo: redirectToProp }: { redirectTo?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectToProp ??
    (redirectParam?.startsWith("/") ? redirectParam : "/member");
  const staffSignIn =
    (redirectParam?.startsWith("/admin") ?? false) || redirectTo.startsWith("/admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<{
    session: string;
    username: string;
    requiredAttributes: string[];
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [challengeAttributes, setChallengeAttributes] = useState<
    Record<string, string>
  >({});

  const GENDER_ATTR = "gender";
  const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "unknown", label: "Prefer not to say" },
  ];

  function isGenderAttribute(name: string) {
    return name === GENDER_ATTR || name === "custom:gender";
  }

  async function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
          redirect: redirectParam?.startsWith("/") ? redirectParam : undefined,
        }),
      });
      const data = await parseResponseJson<Record<string, unknown>>(res);
      if (!res.ok) throw new Error(String(data.error ?? "Sign-in failed"));
      if (data.challenge === "NEW_PASSWORD_REQUIRED") {
        const requiredAttributes = Array.isArray(data.requiredAttributes)
          ? data.requiredAttributes.filter((a: unknown) => typeof a === "string")
          : [GENDER_ATTR];
        setChallenge({
          session: String(data.session),
          username: String(data.username),
          requiredAttributes,
        });
        setChallengeAttributes({});
        return;
      }
      router.push(typeof data.redirect === "string" ? data.redirect : redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const userAttributes: Record<string, string> = {};
    for (const name of challenge.requiredAttributes) {
      const value = challengeAttributes[name]?.trim();
      if (!value) {
        setError(
          isGenderAttribute(name)
            ? "Please select a gender to continue."
            : `Missing required field: ${name}`,
        );
        return;
      }
      userAttributes[name] = value;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: challenge.username,
          newPassword,
          session: challenge.session,
          userAttributes,
          redirect: redirectParam?.startsWith("/") ? redirectParam : undefined,
        }),
      });
      const data = await parseResponseJson<Record<string, unknown>>(res);
      if (!res.ok) throw new Error(String(data.error ?? "Could not set password"));
      router.push(typeof data.redirect === "string" ? data.redirect : redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set password");
    } finally {
      setLoading(false);
    }
  }

  if (challenge) {
    return (
      <AuthShell
        title="Set a new password"
        subtitle="Your account was created with a temporary password. Choose a permanent password."
      >
        <form onSubmit={submitNewPassword} className="space-y-4">
          {error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          {challenge.requiredAttributes.map((attr) =>
            isGenderAttribute(attr) ? (
              <div key={attr} className="space-y-1">
                <span className="block text-sm font-medium text-stone-800">
                  Gender
                </span>
                <select
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                  value={challengeAttributes[attr] ?? ""}
                  onChange={(e) =>
                    setChallengeAttributes((prev) => ({
                      ...prev,
                      [attr]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <TextField
                key={attr}
                label={attr}
                required
                value={challengeAttributes[attr] ?? ""}
                onChange={(e) =>
                  setChallengeAttributes((prev) => ({
                    ...prev,
                    [attr]: e.target.value,
                  }))
                }
              />
            ),
          )}
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
          <PrimaryButton type="submit" disabled={loading} className="mt-2">
            {loading ? "Saving…" : "Save password & continue"}
          </PrimaryButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={staffSignIn ? "Staff sign in" : "Sign in"}
      subtitle={
        staffSignIn
          ? "Use your staff email and password. There is no separate admin login — you are routed by your role after sign-in."
          : usePhoneSignIn
            ? "Sign in with the mobile number on your APYEA membership application."
            : "Sign in with the email on your APYEA membership application. Staff use the same page."
      }
      footer={
        <>
          <Link href="/login/forgot-password" className="font-medium text-[#2F4F3A] hover:underline">
            Forgot password?
          </Link>
          <span className="mx-2">·</span>
          <Link href="/membership/apply" className="hover:underline">
            Apply for membership
          </Link>
        </>
      }
    >
      <form onSubmit={submitSignIn} className="space-y-4">
        {error ? (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
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
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
