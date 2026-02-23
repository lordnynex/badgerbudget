import { useApi } from "./trpcBridge";

export { useApi };
export { TrpcClientProvider, useTrpcClient } from "./trpcClientContext";
export { buildSearchParams } from "./clientCompat";

/** For compatibility with code that unwraps Eden-style responses. tRPC throws on error so we just return the value. */
export async function unwrap<T>(promise: Promise<T>): Promise<T> {
  return promise;
}

export function getErrorMessage(err: unknown, status: number): string {
  if (err instanceof Error) return err.message;
  return `Request failed (${status})`;
}
