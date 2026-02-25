import type { Decorator } from "@storybook/react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "../trpc";
import { TrpcClientProvider } from "../data/api";
import { createMockTrpcLink } from "./mockTrpcLink";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

/**
 * Wraps stories with a full tRPC + React Query provider tree using a mock
 * tRPC client (no real backend). Use for components that call trpc.admin.*.useQuery
 * or useMutation (e.g. BudgetingLayout, components using hooks from queries/hooks).
 */
export const withMockTrpc: Decorator = (Story) => {
  const [client] = useState(() =>
    trpc.createClient({
      links: [createMockTrpcLink()],
    })
  );
  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TrpcClientProvider client={client}>
          <Story />
        </TrpcClientProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
