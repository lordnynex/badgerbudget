import { trpc } from "@/trpc";
import type { ContactSearchParams } from "@/types/contact";
import type { Contact } from "@/types/contact";
import type { MeetingTemplate } from "@/shared/types/meeting";

/**
 * tRPC v11 useSuspenseQuery returns [data, queryResult]; older setups may return { data }.
 * Use this to get the procedure output from either shape.
 */
export function unwrapSuspenseData<T>(returnValue: [T, unknown] | { data?: T }): T | undefined {
  return Array.isArray(returnValue) ? returnValue[0] : (returnValue as { data?: T }).data;
}

// —— Budgets & scenarios
export function useBudgetsSuspense() {
  return trpc.admin.budgets.list.useSuspenseQuery();
}

export function useScenariosSuspense() {
  return trpc.admin.scenarios.list.useSuspenseQuery();
}

export function useBudgetsOptional() {
  return trpc.admin.budgets.list.useQuery();
}

export function useScenariosOptional() {
  return trpc.admin.scenarios.list.useQuery();
}

export function useBudgetSuspense(id: string) {
  return trpc.admin.budgets.get.useSuspenseQuery({ id });
}

export function useScenarioSuspense(id: string) {
  return trpc.admin.scenarios.get.useSuspenseQuery({ id });
}

// —— Events
export function useEventsSuspense(type?: string) {
  return trpc.admin.events.list.useSuspenseQuery(
    type ? { type: type as "badger" | "anniversary" | "pioneer_run" | "rides" } : undefined
  );
}

export function useEventSuspense(id: string) {
  return trpc.admin.events.get.useSuspenseQuery({ id });
}

// —— Members
export function useMembersSuspense() {
  return trpc.admin.members.list.useSuspenseQuery();
}

export function useMemberSuspense(id: string) {
  return trpc.admin.members.get.useSuspenseQuery({ id });
}

// —— Contacts
export function useContactsSuspense(params?: ContactSearchParams) {
  return trpc.admin.contacts.list.useSuspenseQuery((params ?? {}) as Record<string, unknown>);
}

export function useContactSuspense(id: string) {
  return trpc.admin.contacts.get.useSuspenseQuery({ id });
}

export function useContactTags() {
  return trpc.admin.contacts.listTags.useQuery();
}

// —— Mailing lists
export function useMailingListsSuspense() {
  return trpc.admin.mailingLists.list.useSuspenseQuery();
}

export function useMailingListSuspense(id: string) {
  return trpc.admin.mailingLists.get.useSuspenseQuery({ id });
}

export function useMailingListPreview(id: string | null) {
  return trpc.admin.mailingLists.preview.useQuery(
    { id: id! },
    { enabled: !!id }
  );
}

export function useMailingListStats(id: string | null) {
  return trpc.admin.mailingLists.getStats.useQuery(
    { id: id! },
    { enabled: !!id }
  );
}

export function useMailingListIncluded(
  id: string | null,
  page: number,
  limit: number,
  q?: string
) {
  return trpc.admin.mailingLists.getIncluded.useQuery(
    { listId: id!, page, limit, q },
    { enabled: !!id }
  );
}

// —— QR codes
export function useQrCodesSuspense() {
  return trpc.admin.qrCodes.list.useSuspenseQuery();
}

export function useQrCodeSuspense(id: string) {
  return trpc.admin.qrCodes.get.useSuspenseQuery({ id });
}

// —— Meetings
export function useMeetingsSuspense(sort?: "date" | "meeting_number") {
  return trpc.admin.meetings.list.useSuspenseQuery(
    sort ? { sort } : undefined
  );
}

export function useMeetingSuspense(id: string) {
  return trpc.admin.meetings.get.useSuspenseQuery({ id });
}

export function useMeetingsOptional(sort?: "date" | "meeting_number") {
  return trpc.admin.meetings.list.useQuery(sort ? { sort } : undefined);
}

export function useOldBusinessSuspense() {
  return trpc.admin.meetings.listOldBusiness.useSuspenseQuery();
}

export function useMotionsList(page: number, perPage: number, q?: string) {
  return trpc.admin.meetings.listMotions.useQuery({
    page,
    per_page: perPage,
    q,
  });
}

// —— Committees
export function useCommitteesSuspense(sort?: "formed_date" | "name") {
  return trpc.admin.committees.list.useSuspenseQuery(
    sort ? { sort } : undefined
  );
}

export function useCommitteeSuspense(id: string) {
  return trpc.admin.committees.get.useSuspenseQuery({ id });
}

export function useCommitteeMeetingsSuspense(committeeId: string) {
  return trpc.admin.committees.listMeetings.useSuspenseQuery({ committeeId });
}

export function useCommitteeMeetingSuspense(committeeId: string, meetingId: string) {
  return trpc.admin.committees.getMeeting.useSuspenseQuery({
    committeeId,
    meetingId,
  });
}

// —— Meeting templates
export function useMeetingTemplatesSuspense(type?: "agenda" | "minutes") {
  return trpc.admin.meetingTemplates.list.useSuspenseQuery(
    type ? { type } : undefined
  );
}

export function useMeetingTemplatesOptional(type?: "agenda" | "minutes") {
  return trpc.admin.meetingTemplates.list.useQuery(
    type ? { type } : undefined
  );
}

export function useMeetingTemplateSuspense(id: string) {
  return trpc.admin.meetingTemplates.get.useSuspenseQuery({ id });
}

// —— Mailing batches
export function useMailingBatchSuspense(id: string) {
  return trpc.admin.mailingBatches.get.useSuspenseQuery({ id });
}

// —— Cache invalidation and optimistic updates (uses tRPC utils → TanStack Query)
export function useInvalidateQueries() {
  const utils = trpc.useUtils();
  return {
    invalidateBudgets: () => utils.admin.budgets.list.invalidate(),
    invalidateBudget: (id: string) => utils.admin.budgets.get.invalidate({ id }),
    invalidateScenarios: () => utils.admin.scenarios.list.invalidate(),
    invalidateScenario: (id: string) =>
      utils.admin.scenarios.get.invalidate({ id }),
    invalidateEvents: () => utils.admin.events.list.invalidate(),
    invalidateEvent: (id: string) => utils.admin.events.get.invalidate({ id }),
    invalidateMembers: () => utils.admin.members.list.invalidate(),
    invalidateMember: (id: string) =>
      utils.admin.members.get.invalidate({ id }),
    invalidateContacts: () => utils.admin.contacts.list.invalidate(),
    invalidateContact: (id: string) =>
      utils.admin.contacts.get.invalidate({ id }),
    setContactData: (id: string, data: Contact) =>
      utils.admin.contacts.get.setData({ id }, data),
    invalidateMailingLists: () => utils.admin.mailingLists.list.invalidate(),
    invalidateMailingList: (id: string) => {
      utils.admin.mailingLists.get.invalidate({ id });
      utils.admin.mailingLists.preview.invalidate({ id });
      utils.admin.mailingLists.getStats.invalidate({ id });
      utils.admin.mailingLists.getIncluded.invalidate();
    },
    invalidateMailingBatches: () =>
      utils.admin.mailingBatches.list.invalidate(),
    invalidateMailingBatch: (id: string) =>
      utils.admin.mailingBatches.get.invalidate({ id }),
    invalidateQrCodes: () => utils.admin.qrCodes.list.invalidate(),
    invalidateQrCode: (id: string) =>
      utils.admin.qrCodes.get.invalidate({ id }),
    invalidateMeetings: () => utils.admin.meetings.list.invalidate(),
    invalidateMeeting: (id: string) =>
      utils.admin.meetings.get.invalidate({ id }),
    invalidateOldBusiness: () =>
      utils.admin.meetings.listOldBusiness.invalidate(),
    invalidateMeetingTemplates: () =>
      utils.admin.meetingTemplates.list.invalidate(),
    invalidateMeetingTemplate: (id: string) =>
      utils.admin.meetingTemplates.get.invalidate({ id }),
    setMeetingTemplateData: (id: string, data: MeetingTemplate) =>
      utils.admin.meetingTemplates.get.setData({ id }, data),
    invalidateCommittees: () => utils.admin.committees.list.invalidate(),
    invalidateCommittee: (id: string) =>
      utils.admin.committees.get.invalidate({ id }),
    invalidateCommitteeMeetings: (committeeId: string) =>
      utils.admin.committees.listMeetings.invalidate({ committeeId }),
    invalidateCommitteeMeeting: (committeeId: string, meetingId: string) =>
      utils.admin.committees.getMeeting.invalidate({
        committeeId,
        meetingId,
      }),
  };
}
