/**
 * Browser fetch for protected admin APIs (sends session cookies, retries once after refresh).
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const options: RequestInit = {
    credentials: "include",
    ...init,
  };
  let res = await fetch(input, options);
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(input, options);
    }
  }
  return res;
}

export function isAuthError(status: number, errorMessage?: string) {
  if (status === 401) return true;
  return (
    status === 403 &&
    Boolean(
      errorMessage?.toLowerCase().includes("forbidden") ||
        errorMessage?.toLowerCase().includes("unauthorized"),
    )
  );
}
