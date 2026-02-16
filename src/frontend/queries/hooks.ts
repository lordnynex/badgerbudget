import {
  useSuspenseQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/data/api";
import type { ContactSearchParams } from "@/types/contact";
import { queryKeys } from "./keys";

// —— Budgets & scenarios (used only on projections / budget / scenarios pages)
export function useBudgetsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.budgets,
    queryFn: () => api.budgets.list(),
  });
}

export function useScenariosSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.scenarios,
    queryFn: () => api.scenarios.list(),
  });
}

/** Optional fetch (e.g. for event edit dialog dropdowns when not on budget page). */
export function useBudgetsOptional() {
  return useQuery({
    queryKey: queryKeys.budgets,
    queryFn: () => api.budgets.list(),
  });
}

export function useScenariosOptional() {
  return useQuery({
    queryKey: queryKeys.scenarios,
    queryFn: () => api.scenarios.list(),
  });
}

/** Call only when id is non-null (e.g. inside a component rendered when id exists). */
export function useBudgetSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.budget(id),
    queryFn: () => api.budgets.get(id),
  });
}

/** Call only when id is non-null. */
export function useScenarioSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.scenario(id),
    queryFn: () => api.scenarios.get(id),
  });
}

// Optional (non-suspense) for when id might be null – used in layout to avoid suspending with null
export function useBudget(id: string | null) {
  return useQuery({
    queryKey: queryKeys.budget(id ?? ""),
    queryFn: () => api.budgets.get(id!),
    enabled: !!id,
  });
}

export function useScenario(id: string | null) {
  return useQuery({
    queryKey: queryKeys.scenario(id ?? ""),
    queryFn: () => api.scenarios.get(id!),
    enabled: !!id,
  });
}

// —— Events
export function useEventsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.events,
    queryFn: () => api.events.list(),
  });
}

export function useEventSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => api.events.get(id),
  });
}

// —— Members
export function useMembersSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.members,
    queryFn: () => api.members.list(),
  });
}

export function useMemberSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.member(id),
    queryFn: () => api.members.get(id),
  });
}

// —— Contacts (list has params)
export function useContactsSuspense(params: ContactSearchParams) {
  return useSuspenseQuery({
    queryKey: queryKeys.contacts(params as Record<string, unknown>),
    queryFn: () => api.contacts.list(params),
  });
}

export function useContactSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => api.contacts.get(id),
  });
}

export function useContactTags() {
  return useQuery({
    queryKey: queryKeys.contactTags,
    queryFn: () => api.contacts.tags.list(),
  });
}

// —— Mailing lists
export function useMailingListsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.mailingLists,
    queryFn: () => api.mailingLists.list(),
  });
}

/** Call only when id is non-null. */
export function useMailingListSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.mailingList(id),
    queryFn: () => api.mailingLists.get(id),
  });
}

export function useMailingListPreview(id: string | null) {
  return useQuery({
    queryKey: queryKeys.mailingListPreview(id ?? ""),
    queryFn: () => api.mailingLists.preview(id!),
    enabled: !!id,
  });
}

export function useMailingListMembers(id: string | null) {
  return useQuery({
    queryKey: queryKeys.mailingListMembers(id ?? ""),
    queryFn: () => api.mailingLists.getMembers(id!),
    enabled: !!id,
  });
}

// —— Mailing batches
export function useMailingBatchSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.mailingBatch(id),
    queryFn: () => api.mailingBatches.get(id),
  });
}

// —— Mutations (invalidate cache after success)
export function useInvalidateQueries() {
  const qc = useQueryClient();
  return {
    invalidateBudgets: () => qc.invalidateQueries({ queryKey: queryKeys.budgets }),
    invalidateBudget: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.budget(id) }),
    invalidateScenarios: () =>
      qc.invalidateQueries({ queryKey: queryKeys.scenarios }),
    invalidateScenario: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.scenario(id) }),
    invalidateEvents: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
    invalidateEvent: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(id) }),
    invalidateMembers: () =>
      qc.invalidateQueries({ queryKey: queryKeys.members }),
    invalidateMember: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.member(id) }),
    invalidateContacts: () =>
      qc.invalidateQueries({ queryKey: ["contacts"] }),
    invalidateContact: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(id) }),
    invalidateMailingLists: () =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingLists }),
    invalidateMailingList: (id: string) => {
      qc.invalidateQueries({ queryKey: queryKeys.mailingList(id) });
      qc.invalidateQueries({ queryKey: queryKeys.mailingListPreview(id) });
    },
    invalidateMailingBatches: () =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingBatches }),
    invalidateMailingBatch: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingBatch(id) }),
  };
}
