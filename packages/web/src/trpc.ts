import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@badgerbudget/api/trpc";
import { httpBatchLink } from "@trpc/client";

/** Public app uses only trpc.website.* procedures. */
export const trpc = createTRPCReact<AppRouter>();

function getTrpcUrl(): string {
  if (typeof window === "undefined") return "http://localhost:3001";
  return window.location.origin;
}

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getTrpcUrl()}/trpc`,
      }),
    ],
  });
}
