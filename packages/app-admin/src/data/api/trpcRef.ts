import type { createTrpcClient } from "@/trpc";

export type TrpcClient = ReturnType<typeof createTrpcClient>;

const ref: { current: TrpcClient | null } = { current: null };

export function setTrpcClient(client: TrpcClient) {
  ref.current = client;
}

export function getTrpcClient(): TrpcClient {
  if (!ref.current) throw new Error("tRPC client not initialized");
  return ref.current;
}
