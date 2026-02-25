import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/data/api";
import { trpc } from "@/trpc";
import { queryKeys } from "@/queries/keys";
import type { ContactSearchParams } from "@satyrsmc/shared/types/contact";
import type { Contact } from "@satyrsmc/shared/types/contact";
import type { MeetingTemplate } from "@satyrsmc/shared/types/meeting";

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
export function useBudgetOptional(id: string, options?: { enabled?: boolean }) {
  return trpc.admin.budgets.get.useQuery(
    { id },
    { enabled: options?.enabled !== false && !!id, ...options }
  );
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
export function useEventsOptional(type?: string) {
  return trpc.admin.events.list.useQuery(
    type ? ({ type: type as "badger" | "anniversary" | "pioneer_run" | "rides" }) : undefined
  );
}

// —— Members
export function useMembersSuspense() {
  return trpc.admin.members.list.useSuspenseQuery();
}

export function useMembersOptional() {
  return trpc.admin.members.list.useQuery();
}

export function useMemberSuspense(id: string) {
  return trpc.admin.members.get.useSuspenseQuery({ id });
}
export function useMemberOptional(id: string, options?: { enabled?: boolean }) {
  return trpc.admin.members.get.useQuery(
    { id },
    { enabled: options?.enabled !== false && !!id, ...options }
  );
}

// —— Contacts
export function useContactsSuspense(params?: ContactSearchParams) {
  return trpc.admin.contacts.list.useSuspenseQuery((params ?? {}) as Record<string, unknown>);
}

export function useContactsOptional(
  params?: ContactSearchParams,
  options?: { enabled?: boolean }
) {
  return trpc.admin.contacts.list.useQuery((params ?? {}) as Record<string, unknown>, options);
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

export function useMailingListsOptional() {
  return trpc.admin.mailingLists.list.useQuery();
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

export function useMailingListMembers(listId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.mailingListMembers(listId ?? ""),
    queryFn: () => api.mailingLists.getMembers(listId!),
    enabled: !!listId,
  });
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

// —— Website (admin)
export function useWebsitePagesOptional() {
  return trpc.admin.website.listPages.useQuery();
}

export function useWebsiteSettingsOptional() {
  return trpc.admin.website.getSettings.useQuery();
}

export function useWebsiteMenusOptional() {
  return trpc.admin.website.getMenus.useQuery();
}
export function useWebsiteContactSubmissions() {
  const api = useApi();
  return useQuery({
    queryKey: ["website", "contact-submissions"],
    queryFn: () => api.website.listContactSubmissions(),
  });
}
export function useWebsiteContactMemberSubmissions() {
  const api = useApi();
  return useQuery({
    queryKey: ["website", "contact-member-submissions"],
    queryFn: () => api.website.listContactMemberSubmissions(),
  });
}
export function useWebsiteBlogAll() {
  const api = useApi();
  return useQuery({
    queryKey: ["website", "blog", "admin"],
    queryFn: () => api.website.listBlogAll(),
  });
}
export function useWebsiteMembersFeed() {
  const api = useApi();
  return useQuery({
    queryKey: ["website", "members-feed"],
    queryFn: () => api.website.getMembersFeed(),
  });
}
export function useWebsiteEventsFeed() {
  return trpc.website.getEventsFeed.useQuery();
}

// —— Mutation hooks (use useApi + useMutation so Storybook mock API works)

// Mailing lists
export function useCreateMailingList() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.mailingLists.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mailingLists }),
  });
}
export function useUpdateMailingList() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.mailingLists.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.mailingLists });
      qc.invalidateQueries({ queryKey: queryKeys.mailingList(id) });
    },
  });
}
export function useDeleteMailingList() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.mailingLists.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mailingLists }),
  });
}
export function useMailingListAddMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, contactId }: { listId: string; contactId: string }) =>
      api.mailingLists.addMember(listId, contactId),
    onSuccess: (_, { listId }) => qc.invalidateQueries({ queryKey: queryKeys.mailingList(listId) }),
  });
}
export function useMailingListRemoveMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, contactId }: { listId: string; contactId: string }) =>
      api.mailingLists.removeMember(listId, contactId),
    onSuccess: (_, { listId }) => qc.invalidateQueries({ queryKey: queryKeys.mailingList(listId) }),
  });
}
export function useMailingListReinstateMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, contactId }: { listId: string; contactId: string }) =>
      api.mailingLists.reinstateMember(listId, contactId),
    onSuccess: (_, { listId }) => qc.invalidateQueries({ queryKey: queryKeys.mailingList(listId) }),
  });
}
export function useMailingListAddMembersBulk() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      contactIds,
      source,
    }: {
      listId: string;
      contactIds: string[];
      source?: "manual" | "import" | "rule";
    }) => api.mailingLists.addMembersBulk(listId, contactIds, source),
    onSuccess: (_, { listId }) => qc.invalidateQueries({ queryKey: queryKeys.mailingList(listId) }),
  });
}
export function useMailingListAddAllContacts() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => api.mailingLists.addAllContacts(listId),
    onSuccess: (_, listId) => qc.invalidateQueries({ queryKey: queryKeys.mailingList(listId) }),
  });
}
export function useMailingListAddAllHellenics() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => api.mailingLists.addAllHellenics(listId),
    onSuccess: (_, listId) => qc.invalidateQueries({ queryKey: queryKeys.mailingList(listId) }),
  });
}

// Scenarios
export function useCreateScenario() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; inputs?: Record<string, unknown> }) =>
      api.scenarios.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.scenarios }),
  });
}
export function useUpdateScenario() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; description?: string; inputs?: Record<string, unknown> };
    }) => api.scenarios.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.scenarios });
      qc.invalidateQueries({ queryKey: queryKeys.scenario(id) });
    },
  });
}
export function useDeleteScenario() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.scenarios.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.scenarios }),
  });
}

// Budgets
export function useCreateBudget() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; year: number; description?: string }) =>
      api.budgets.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.budgets }),
  });
}
export function useUpdateBudget() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; year?: number; description?: string };
    }) => api.budgets.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets });
      qc.invalidateQueries({ queryKey: queryKeys.budget(id) });
    },
  });
}
export function useDeleteBudget() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.budgets.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.budgets }),
  });
}
export function useAddLineItem() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ budgetId, body }: { budgetId: string; body: Record<string, unknown> }) =>
      api.budgets.addLineItem(budgetId, body),
    onSuccess: (_, { budgetId }) => qc.invalidateQueries({ queryKey: queryKeys.budget(budgetId) }),
  });
}
export function useUpdateLineItem() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      budgetId,
      itemId,
      body,
    }: {
      budgetId: string;
      itemId: string;
      body: Record<string, unknown>;
    }) => api.budgets.updateLineItem(budgetId, itemId, body),
    onSuccess: (_, { budgetId }) => qc.invalidateQueries({ queryKey: queryKeys.budget(budgetId) }),
  });
}
export function useDeleteLineItem() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ budgetId, itemId }: { budgetId: string; itemId: string }) =>
      api.budgets.deleteLineItem(budgetId, itemId),
    onSuccess: (_, { budgetId }) => qc.invalidateQueries({ queryKey: queryKeys.budget(budgetId) }),
  });
}

// Contacts
export function useCreateContact() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Contact> & { display_name: string }) => api.contacts.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}
export function useUpdateContact() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.contacts.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ predicate: (q) => (q.queryKey as unknown[])[0] === "contacts" });
      qc.invalidateQueries({ queryKey: queryKeys.contact(id) });
    },
  });
}
export function useDeleteContact() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.contacts.delete(id),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => (q.queryKey as unknown[])[0] === "contacts" }),
  });
}
export function useRestoreContact() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.contacts.restore(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: queryKeys.contact(id) }),
  });
}
export function useContactsBulkUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      args: {
        ids: string[];
        updates: {
          tags?: (string | { id: string; name: string })[];
          status?: "active" | "inactive";
        };
      }
    ) => api.contacts.bulkUpdate(args.ids, args.updates),
    onSuccess: () =>
      qc.invalidateQueries({ predicate: (q) => (q.queryKey as unknown[])[0] === "contacts" }),
  });
}
export function useContactsListFetcher() {
  const api = useApi();
  return (params?: ContactSearchParams) => api.contacts.list(params);
}
export function useContactMailingLists(contactId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["contact", contactId, "mailingLists"],
    queryFn: async () => {
      if (!contactId) return [];
      const lists = await api.mailingLists.list();
      const withContact = await Promise.all(
        lists.map(async (l) => {
          const mems = await api.mailingLists.getMembers(l.id);
          return mems.some((m) => m.contact_id === contactId) ? l : null;
        })
      );
      return withContact.filter(Boolean) as Awaited<ReturnType<typeof api.mailingLists.list>>;
    },
    enabled: !!contactId,
  });
}
export function useContactNoteCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, content }: { contactId: string; content: string }) =>
      api.contacts.notes.create(contactId, content),
    onSuccess: (_, { contactId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(contactId) }),
  });
}
export function useContactNoteUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contactId,
      noteId,
      content,
    }: {
      contactId: string;
      noteId: string;
      content: string;
    }) => api.contacts.notes.update(contactId, noteId, content),
    onSuccess: (_, { contactId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(contactId) }),
  });
}
export function useContactNoteDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, noteId }: { contactId: string; noteId: string }) =>
      api.contacts.notes.delete(contactId, noteId),
    onSuccess: (_, { contactId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(contactId) }),
  });
}
export function useContactPhotoAdd() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contactId,
      file,
      options,
    }: {
      contactId: string;
      file: File;
      options?: { set_as_profile?: boolean };
    }) => api.contacts.photos.add(contactId, file, options),
    onSuccess: (_, { contactId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(contactId) }),
  });
}
export function useContactPhotoDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, photoId }: { contactId: string; photoId: string }) =>
      api.contacts.photos.delete(contactId, photoId),
    onSuccess: (_, { contactId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(contactId) }),
  });
}
export function useContactPhotoSetProfile() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, photoId }: { contactId: string; photoId: string }) =>
      api.contacts.photos.setProfile(contactId, photoId),
    onSuccess: (_, { contactId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.contact(contactId) }),
  });
}

// Members
export function useCreateMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.members.create>[0]) => api.members.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members }),
  });
}
export function useUpdateMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.members.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.members });
      qc.invalidateQueries({ queryKey: queryKeys.member(id) });
      qc.invalidateQueries({ queryKey: ["website", "members-feed"] });
    },
  });
}
export function useDeleteMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.members.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members }),
  });
}

// Events
export function useCreateEvent() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.events.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events() }),
  });
}
export function useUpdateEvent() {
  const api = useApi();
  const qc = useQueryClient();
  const utils = trpc.useUtils();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.events.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.events() });
      qc.invalidateQueries({ queryKey: queryKeys.event(id) });
      void utils.website.getEventsFeed.invalidate();
    },
  });
}
export function useDeleteEvent() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.events.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events() }),
  });
}
export function useEventIncidentUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      incidentId,
      body,
    }: {
      eventId: string;
      incidentId: string;
      body: Record<string, unknown>;
    }) => api.events.incidents.update(eventId, incidentId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventIncidentDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, incidentId }: { eventId: string; incidentId: string }) =>
      api.events.incidents.delete(eventId, incidentId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useIncidentsList(page: number, perPage: number) {
  const api = useApi();
  return useQuery({
    queryKey: ["incidents", page, perPage],
    queryFn: () => api.incidents.list({ page, per_page: perPage }),
  });
}
export function useEventIncidentCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: Record<string, unknown>;
    }) => api.events.incidents.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}

// Event sub-resources (attendees, schedule, assets, milestones, packing, volunteers, assignments, photos)
export function useEventAttendeeAdd() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: { contact_id: string; waiver_signed?: boolean };
    }) => api.events.attendees.add(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAttendeeUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      attendeeId,
      body,
    }: {
      eventId: string;
      attendeeId: string;
      body: { waiver_signed?: boolean };
    }) => api.events.attendees.update(eventId, attendeeId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAttendeeDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      attendeeId,
    }: { eventId: string; attendeeId: string }) =>
      api.events.attendees.delete(eventId, attendeeId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMemberAttendeeAdd() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: { member_id: string; waiver_signed?: boolean };
    }) => api.events.memberAttendees.add(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMemberAttendeeUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      attendeeId,
      body,
    }: {
      eventId: string;
      attendeeId: string;
      body: { waiver_signed?: boolean };
    }) => api.events.memberAttendees.update(eventId, attendeeId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMemberAttendeeDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      attendeeId,
    }: { eventId: string; attendeeId: string }) =>
      api.events.memberAttendees.delete(eventId, attendeeId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventScheduleItemCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: { scheduled_time: string; label: string; location?: string };
    }) => api.events.scheduleItems.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventScheduleItemUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      scheduleId,
      body,
    }: {
      eventId: string;
      scheduleId: string;
      body: Record<string, unknown>;
    }) => api.events.scheduleItems.update(eventId, scheduleId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventScheduleItemDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      scheduleId,
    }: { eventId: string; scheduleId: string }) =>
      api.events.scheduleItems.delete(eventId, scheduleId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAssetAdd() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, file }: { eventId: string; file: File }) =>
      api.events.assets.add(eventId, file),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAssetDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      assetId,
    }: { eventId: string; assetId: string }) =>
      api.events.assets.delete(eventId, assetId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMilestoneCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: { month: number; year: number; description: string; due_date?: string };
    }) => api.events.milestones.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMilestoneUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      mid,
      body,
    }: {
      eventId: string;
      mid: string;
      body: Record<string, unknown>;
    }) => api.events.milestones.update(eventId, mid, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMilestoneDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, mid }: { eventId: string; mid: string }) =>
      api.events.milestones.delete(eventId, mid),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMilestoneAddMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      mid,
      memberId,
    }: { eventId: string; mid: string; memberId: string }) =>
      api.events.milestones.addMember(eventId, mid, memberId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventMilestoneRemoveMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      mid,
      memberId,
    }: { eventId: string; mid: string; memberId: string }) =>
      api.events.milestones.removeMember(eventId, mid, memberId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventPackingCategoryCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: { eventId: string; body: { name: string } }) =>
      api.events.packingCategories.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventPackingItemCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: { category_id: string; name: string; quantity?: number; note?: string };
    }) => api.events.packingItems.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventPackingItemUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      pid,
      body,
    }: {
      eventId: string;
      pid: string;
      body: Record<string, unknown>;
    }) => api.events.packingItems.update(eventId, pid, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventPackingItemDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      pid,
    }: { eventId: string; pid: string }) =>
      api.events.packingItems.delete(eventId, pid),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventVolunteerCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: { eventId: string; body: { name: string; department: string } }) =>
      api.events.volunteers.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventVolunteerDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      vid,
    }: { eventId: string; vid: string }) =>
      api.events.volunteers.delete(eventId, vid),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAssignmentCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: string;
      body: { name: string; category: "planning" | "during" };
    }) => api.events.assignments.create(eventId, body),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAssignmentDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      aid,
    }: { eventId: string; aid: string }) =>
      api.events.assignments.delete(eventId, aid),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAssignmentAddMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      aid,
      memberId,
    }: { eventId: string; aid: string; memberId: string }) =>
      api.events.assignments.addMember(eventId, aid, memberId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventAssignmentRemoveMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      aid,
      memberId,
    }: { eventId: string; aid: string; memberId: string }) =>
      api.events.assignments.removeMember(eventId, aid, memberId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventPhotoAdd() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, file }: { eventId: string; file: File }) =>
      api.events.photos.add(eventId, file),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}
export function useEventPhotoDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      photoId,
    }: { eventId: string; photoId: string }) =>
      api.events.photos.delete(eventId, photoId),
    onSuccess: (_, { eventId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
  });
}

// Meeting templates
export function useCreateMeetingTemplate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; type: "agenda" | "minutes"; content: string }) =>
      api.meetingTemplates.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.meetingTemplates() }),
  });
}
export function useUpdateMeetingTemplate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.meetingTemplates.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.meetingTemplates() });
      qc.invalidateQueries({ queryKey: queryKeys.meetingTemplate(id) });
    },
  });
}
export function useDeleteMeetingTemplate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.meetingTemplates.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.meetingTemplates() }),
  });
}

// Committees
export function useCreateCommittee() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string | null;
      purpose?: string | null;
      formed_date: string;
      chairperson_member_id?: string | null;
      member_ids?: string[];
    }) => api.committees.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.committees() }),
  });
}
export function useUpdateCommittee() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.committees.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.committees() });
      qc.invalidateQueries({ queryKey: queryKeys.committee(id) });
    },
  });
}
export function useDeleteCommittee() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.committees.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.committees() }),
  });
}
export function useCommitteeAddMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ committeeId, memberId }: { committeeId: string; memberId: string }) =>
      api.committees.addMember(committeeId, memberId),
    onSuccess: (_, { committeeId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.committee(committeeId) }),
  });
}
export function useCommitteeRemoveMember() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ committeeId, memberId }: { committeeId: string; memberId: string }) =>
      api.committees.removeMember(committeeId, memberId),
    onSuccess: (_, { committeeId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.committee(committeeId) }),
  });
}
export function useCreateCommitteeMeeting() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      committeeId,
      body,
    }: {
      committeeId: string;
      body: Record<string, unknown>;
    }) => api.committees.createMeeting(committeeId, body as never),
    onSuccess: (_, { committeeId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.committeeMeetings(committeeId) });
      qc.invalidateQueries({ queryKey: queryKeys.committee(committeeId) });
    },
  });
}
export function useUpdateCommitteeMeeting() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      committeeId,
      meetingId,
      body,
    }: {
      committeeId: string;
      meetingId: string;
      body: Record<string, unknown>;
    }) => api.committees.updateMeeting(committeeId, meetingId, body as never),
    onSuccess: (_, { committeeId, meetingId }) =>
      qc.invalidateQueries({
        queryKey: queryKeys.committeeMeeting(committeeId, meetingId),
      }),
  });
}
export function useDeleteCommitteeMeeting() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ committeeId, meetingId }: { committeeId: string; meetingId: string }) =>
      api.committees.deleteMeeting(committeeId, meetingId),
    onSuccess: (_, { committeeId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.committeeMeetings(committeeId) }),
  });
}

// Meetings
export function useCreateMeeting() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      date: string;
      meeting_number: number;
      location?: string | null;
      previous_meeting_id?: string | null;
      agenda_content?: string;
      minutes_content?: string | null;
      agenda_template_id?: string;
    }) => api.meetings.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.meetings() }),
  });
}
export function useUpdateMeeting() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.meetings.update(id, body as never),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings() });
      qc.invalidateQueries({ queryKey: queryKeys.meeting(id) });
    },
  });
}
export function useDeleteMeeting() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: string;
      delete_agenda?: boolean;
      delete_minutes?: boolean;
    }) =>
      api.meetings.delete(args.id, args.delete_agenda, args.delete_minutes),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.meetings() }),
  });
}
export function useOldBusinessCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      body,
    }: {
      meetingId: string;
      body: { description: string; order_index?: number };
    }) => api.meetings.oldBusiness.create(meetingId, body),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useOldBusinessUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      id: oid,
      body,
    }: {
      meetingId: string;
      id: string;
      body: Record<string, unknown>;
    }) => api.meetings.oldBusiness.update(meetingId, oid, body),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useOldBusinessDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, id: oid }: { meetingId: string; id: string }) =>
      api.meetings.oldBusiness.delete(meetingId, oid),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useMotionCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      body,
    }: {
      meetingId: string;
      body: {
        description?: string | null;
        result: "pass" | "fail";
        order_index?: number;
        mover_member_id: string;
        seconder_member_id: string;
      };
    }) => api.meetings.motions.create(meetingId, body),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useMotionUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      motionId,
      body,
    }: {
      meetingId: string;
      motionId: string;
      body: Record<string, unknown>;
    }) => api.meetings.motions.update(meetingId, motionId, body),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useMotionDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, motionId }: { meetingId: string; motionId: string }) =>
      api.meetings.motions.delete(meetingId, motionId),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useActionItemCreate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      body,
    }: {
      meetingId: string;
      body: {
        description: string;
        assignee_member_id?: string | null;
        due_date?: string | null;
        order_index?: number;
      };
    }) => api.meetings.actionItems.create(meetingId, body),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useActionItemUpdate() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      actionItemId,
      body,
    }: {
      meetingId: string;
      actionItemId: string;
      body: Record<string, unknown>;
    }) => api.meetings.actionItems.update(meetingId, actionItemId, body),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}
export function useActionItemDelete() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      actionItemId,
    }: {
      meetingId: string;
      actionItemId: string;
    }) => api.meetings.actionItems.delete(meetingId, actionItemId),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.meeting(meetingId) }),
  });
}

// Documents
export function useUpdateDocument() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { content: string } }) =>
      api.documents.update(id, body),
    onSuccess: () => {},
  });
}
export function useExportDocumentPdf() {
  const api = useApi();
  return useMutation({
    mutationFn: ({ documentId, filename }: { documentId: string; filename: string }) =>
      api.documents.exportPdf(documentId, filename),
  });
}

// Website
export function useWebsiteCreatePage() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.website.createPage(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.websitePages }),
  });
}
export function useWebsiteUpdatePage() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.website.updatePage(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.websitePages }),
  });
}
export function useWebsiteDeletePage() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.website.deletePage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.websitePages }),
  });
}
export function useWebsiteUpdateSettings() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.website.updateSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.websiteSettings }),
  });
}
export function useWebsiteUpdateMenu() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, items }: { key: string; items: unknown[] }) =>
      api.website.updateMenu(key, items),
    onSuccess: () => {},
  });
}

// QR codes
export function useCreateQrCode() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Parameters<typeof api.qrCodes.create>[0]
    ) => api.qrCodes.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}
export function useUpdateQrCode() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof api.qrCodes.update>[1];
    }) => api.qrCodes.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.qrCodes });
      qc.invalidateQueries({ queryKey: queryKeys.qrCode(id) });
    },
  });
}
export function useDeleteQrCode() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.qrCodes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}
export function useQrCodeImageUrl(id: string, size?: number) {
  const api = useApi();
  return useQuery({
    queryKey: [...queryKeys.qrCode(id), "image", size ?? 256],
    queryFn: () => api.qrCodes.getImageUrl(id, size ?? 256),
    enabled: !!id,
  });
}
export function useContactsImportPstPreview() {
  const api = useApi();
  return useMutation({
    mutationFn: (file: File) => api.contacts.importPstPreview(file),
  });
}
export function useContactsImportPstExecute() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      toCreate: Array<Record<string, unknown> & { display_name: string }>
    ) => api.contacts.importPstExecute(toCreate),
    onSuccess: () =>
      qc.invalidateQueries({ predicate: (q) => (q.queryKey as unknown[])[0] === "contacts" }),
  });
}

// Mailing batch recipient status
export function useUpdateMailingBatchRecipientStatus() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      recipientId,
      status,
      reason,
    }: {
      batchId: string;
      recipientId: string;
      status: string;
      reason?: string;
    }) =>
      api.mailingBatches.updateRecipientStatus(batchId, recipientId, status, reason),
    onSuccess: (_, { batchId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.mailingBatch(batchId) }),
  });
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
