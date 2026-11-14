/** Parse JSON from a fetch Response without throwing on empty bodies. */
export async function parseResponseJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(res.ok ? "Empty response from server" : `Request failed (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid response from server (${res.status})`);
  }
}