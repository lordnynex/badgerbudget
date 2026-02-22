import {
  useSuspenseQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/data/api";
import type {
  Contact,
  ContactSearchParams,
  MailingList,
  ListPreview,
  MailingListStats,
  MailingListIncludedPage,
} from "@/types/contact";
import type { Budget, BudgetSummary, Scenario, ScenarioSummary } from "@/types/budget";
import { queryKeys } from "./keys";

// —— Budgets & scenarios (used only on projections / budget / scenarios pages)
export function useBudgetsSuspense() {
  return useSuspenseQuery<BudgetSummary[]>({
    queryKey: queryKeys.budgets,
    queryFn: async () => (await api.budgets.list()) as unknown as BudgetSummary[],
  });
}

export function useScenariosSuspense() {
  return useSuspenseQuery<ScenarioSummary[]>({
    queryKey: queryKeys.scenarios,
    queryFn: async () => (await api.scenarios.list()) as unknown as ScenarioSummary[],
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
  return useSuspenseQuery<Budget>({
    queryKey: queryKeys.budget(id),
    queryFn: async () => (await api.budgets.get(id)) as unknown as Budget,
  });
}

/** Call only when id is non-null. */
export function useScenarioSuspense(id: string) {
  return useSuspenseQuery<Scenario>({
    queryKey: queryKeys.scenario(id),
    queryFn: async () => (await api.scenarios.get(id)) as unknown as Scenario,
  });
}

// —— Events
export function useEventsSuspense(type?: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.events(type),
    queryFn: () => api.events.list(type ? { type } : undefined),
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
  return useSuspenseQuery<MailingList | null>({
    queryKey: queryKeys.mailingList(id),
    queryFn: async () => (await api.mailingLists.get(id)) as MailingList | null,
  });
}

export function useMailingListPreview(id: string | null) {
  return useQuery<ListPreview | null>({
    queryKey: queryKeys.mailingListPreview(id ?? ""),
    queryFn: async () =>
      (await api.mailingLists.preview(id!)) as ListPreview | null,
    enabled: !!id,
  });
}

export function useMailingListStats(id: string | null) {
  return useQuery<MailingListStats | null>({
    queryKey: queryKeys.mailingListStats(id ?? ""),
    queryFn: async () =>
      (await api.mailingLists.getStats(id!)) as MailingListStats | null,
    enabled: !!id,
  });
}

export function useMailingListIncluded(
  id: string | null,
  page: number,
  limit: number,
  q?: string,
) {
  return useQuery<MailingListIncludedPage | null>({
    queryKey: queryKeys.mailingListIncluded(id ?? "", page, limit, q),
    queryFn: () => api.mailingLists.getIncluded(id!, { page, limit, q }),
    enabled: !!id,
  });
}

// —— QR codes
export function useQrCodesSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.qrCodes,
    queryFn: () => api.qrCodes.list(),
  });
}

export function useQrCodeSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.qrCode(id),
    queryFn: () => api.qrCodes.get(id),
  });
}

// —— Meetings
export function useMeetingsSuspense(sort?: "date" | "meeting_number") {
  return useSuspenseQuery({
    queryKey: queryKeys.meetings(sort),
    queryFn: () => api.meetings.list(sort ? { sort } : undefined),
  });
}

export function useMeetingSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.meeting(id),
    queryFn: () => api.meetings.get(id),
  });
}

export function useMeetingsOptional(sort?: "date" | "meeting_number") {
  return useQuery({
    queryKey: queryKeys.meetings(sort),
    queryFn: () => api.meetings.list(sort ? { sort } : undefined),
  });
}

export function useOldBusinessSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.oldBusiness,
    queryFn: () => api.meetings.listOldBusiness(),
  });
}

export function useMotionsList(page: number, perPage: number, q?: string) {
  return useQuery({
    queryKey: queryKeys.motionsList(page, perPage, q),
    queryFn: () => api.meetings.listMotions({ page, per_page: perPage, q }),
  });
}

// —— Committees
export function useCommitteesSuspense(sort?: "formed_date" | "name") {
  return useSuspenseQuery({
    queryKey: queryKeys.committees(sort),
    queryFn: () => api.committees.list(sort ? { sort } : undefined),
  });
}

export function useCommitteeSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.committee(id),
    queryFn: () => api.committees.get(id),
  });
}

export function useCommitteeMeetingsSuspense(committeeId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.committeeMeetings(committeeId),
    queryFn: () =>
      api.committees.listMeetings(committeeId).then((r) => r ?? []),
  });
}

export function useCommitteeMeetingSuspense(committeeId: string, meetingId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.committeeMeeting(committeeId, meetingId),
    queryFn: () => api.committees.getMeeting(committeeId, meetingId),
  });
}

// —— Meeting templates
export function useMeetingTemplatesSuspense(type?: "agenda" | "minutes") {
  return useSuspenseQuery({
    queryKey: queryKeys.meetingTemplates(type),
    queryFn: () => api.meetingTemplates.list(type ? { type } : undefined),
  });
}

export function useMeetingTemplatesOptional(type?: "agenda" | "minutes") {
  return useQuery({
    queryKey: queryKeys.meetingTemplates(type),
    queryFn: () => api.meetingTemplates.list(type ? { type } : undefined),
  });
}

export function useMeetingTemplateSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.meetingTemplate(id),
    queryFn: () => api.meetingTemplates.get(id),
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
    invalidateBudgets: () =>
      qc.invalidateQueries({ queryKey: queryKeys.budgets }),
    invalidateBudget: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.budget(id) }),
    invalidateScenarios: () =>
      qc.invalidateQueries({ queryKey: queryKeys.scenarios }),
    invalidateScenario: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.scenario(id) }),
    invalidateEvents: () =>
      qc.invalidateQueries({ queryKey: queryKeys.events() }),
    invalidateEvent: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(id) }),
    invalidateMembers: () =>
      qc.invalidateQueries({ queryKey: queryKeys.members }),
    invalidateMember: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.member(id) }),
    invalidateContacts: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
    invalidateContact: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(id) }),
    setContactData: (id: string, data: Contact) =>
      qc.setQueryData(queryKeys.contact(id), data),
    invalidateMailingLists: () =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingLists }),
    invalidateMailingList: (id: string) => {
      qc.invalidateQueries({ queryKey: queryKeys.mailingList(id) });
      qc.invalidateQueries({ queryKey: queryKeys.mailingListPreview(id) });
      qc.invalidateQueries({ queryKey: queryKeys.mailingListStats(id) });
      qc.invalidateQueries({ queryKey: ["mailingList", id, "included"] });
    },
    invalidateMailingBatches: () =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingBatches }),
    invalidateMailingBatch: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingBatch(id) }),
    invalidateQrCodes: () =>
      qc.invalidateQueries({ queryKey: queryKeys.qrCodes }),
    invalidateQrCode: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.qrCode(id) }),
    invalidateMeetings: () =>
      qc.invalidateQueries({ queryKey: queryKeys.meetings() }),
    invalidateMeeting: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(id) }),
    invalidateOldBusiness: () =>
      qc.invalidateQueries({ queryKey: queryKeys.oldBusiness }),
    invalidateMeetingTemplates: () =>
      qc.invalidateQueries({ queryKey: queryKeys.meetingTemplates() }),
    invalidateMeetingTemplate: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.meetingTemplate(id) }),
    setMeetingTemplateData: (id: string, data: import("@/shared/types/meeting").MeetingTemplate) =>
      qc.setQueryData(queryKeys.meetingTemplate(id), data),
    invalidateCommittees: () =>
      qc.invalidateQueries({ queryKey: queryKeys.committees() }),
    invalidateCommittee: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.committee(id) }),
    invalidateCommitteeMeetings: (committeeId: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.committeeMeetings(committeeId) }),
    invalidateCommitteeMeeting: (committeeId: string, meetingId: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.committeeMeeting(committeeId, meetingId) }),
  };
}
