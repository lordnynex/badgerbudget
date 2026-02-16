import { treaty } from "@elysiajs/eden";
import type { App } from "@/backend/app";

export const client = treaty<App>(
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000",
  { parseDate: false },
);

export function getErrorMessage(err: unknown, status: number): string {
  if (!err || typeof err !== "object") return `Request failed (${status})`;
  const e = err as { value?: unknown };
  const v = e.value;
  if (typeof v === "string") return v;
  if (
    v &&
    typeof v === "object" &&
    "error" in v &&
    typeof (v as { error: unknown }).error === "string"
  ) {
    return (v as { error: string }).error;
  }
  return `Request failed (${status})`;
}

export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; status: number }>,
): Promise<T> {
  const res = await promise;
  if (res.error) {
    throw new Error(getErrorMessage(res.error, res.status));
  }
  return res.data as T;
}

export function buildSearchParams(
  params: Record<string, string | number | boolean | undefined | string[]>,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length) sp.set(k, v.join(","));
    } else {
      sp.set(k, String(v));
    }
  }
  return sp.toString();
}
