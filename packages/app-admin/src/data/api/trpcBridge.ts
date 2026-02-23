/**
 * API bridge that delegates to the tRPC client from React context.
 * Use useApi() inside components that need to call the API imperatively.
 */
import { useMemo } from "react";
import { useTrpcClient } from "./trpcClientContext";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64 ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildApi(client: ReturnType<typeof useTrpcClient>) {
  return {
    events: {
      list: (opts?: { type?: string }) =>
        client.admin.events.list.query(opts?.type ? { type: opts.type } : undefined),
      get: (id: string) => client.admin.events.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.events.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.events.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.events.delete.mutate({ id }),
      photos: {
        add: async (eventId: string, file: File) => {
          const imageBase64 = await fileToBase64(file);
          return client.admin.events.addPhoto.mutate({ eventId, imageBase64 });
        },
        delete: async (eventId: string, photoId: string) =>
          client.admin.events.deletePhoto.mutate({ eventId, photoId }),
      },
      assets: {
        add: async (eventId: string, file: File) => {
          const imageBase64 = await fileToBase64(file);
          return client.admin.events.addAsset.mutate({ eventId, imageBase64 });
        },
        delete: async (eventId: string, assetId: string) =>
          client.admin.events.deleteAsset.mutate({ eventId, assetId }),
      },
      attendees: {
        add: async (
          eventId: string,
          body: { contact_id: string; waiver_signed?: boolean }
        ) => client.admin.events.addAttendee.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          attendeeId: string,
          body: { waiver_signed?: boolean }
        ) => client.admin.events.updateAttendee.mutate({ eventId, attendeeId, ...body }),
        delete: async (eventId: string, attendeeId: string) =>
          client.admin.events.deleteAttendee.mutate({ eventId, attendeeId }),
      },
      milestones: {
        create: async (
          eventId: string,
          body: { month: number; year: number; description: string; due_date?: string }
        ) => client.admin.events.createMilestone.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          mid: string,
          body: {
            month?: number;
            year?: number;
            description?: string;
            completed?: boolean;
            due_date?: string;
          }
        ) => client.admin.events.updateMilestone.mutate({ eventId, mid, ...body }),
        delete: async (eventId: string, mid: string) =>
          client.admin.events.deleteMilestone.mutate({ eventId, mid }),
        addMember: async (eventId: string, mid: string, memberId: string) =>
          client.admin.events.addMilestoneMember.mutate({ eventId, mid, memberId }),
        removeMember: async (eventId: string, mid: string, memberId: string) =>
          client.admin.events.removeMilestoneMember.mutate({ eventId, mid, memberId }),
      },
      packingCategories: {
        create: async (eventId: string, body: { name: string }) =>
          client.admin.events.createPackingCategory.mutate({ eventId, ...body }),
        update: async (eventId: string, cid: string, body: { name?: string }) =>
          client.admin.events.updatePackingCategory.mutate({ eventId, cid, ...body }),
        delete: async (eventId: string, cid: string) =>
          client.admin.events.deletePackingCategory.mutate({ eventId, cid }),
      },
      packingItems: {
        create: async (
          eventId: string,
          body: { category_id: string; name: string; quantity?: number; note?: string }
        ) => client.admin.events.createPackingItem.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          pid: string,
          body: {
            category_id?: string;
            name?: string;
            quantity?: number;
            note?: string;
            loaded?: boolean;
          }
        ) => client.admin.events.updatePackingItem.mutate({ eventId, pid, ...body }),
        delete: async (eventId: string, pid: string) =>
          client.admin.events.deletePackingItem.mutate({ eventId, pid }),
      },
      assignments: {
        create: async (
          eventId: string,
          body: { name: string; category: "planning" | "during" }
        ) => client.admin.events.createAssignment.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          aid: string,
          body: { name?: string; category?: "planning" | "during" }
        ) => client.admin.events.updateAssignment.mutate({ eventId, aid, ...body }),
        delete: async (eventId: string, aid: string) =>
          client.admin.events.deleteAssignment.mutate({ eventId, aid }),
        addMember: async (eventId: string, aid: string, memberId: string) =>
          client.admin.events.addAssignmentMember.mutate({ eventId, aid, memberId }),
        removeMember: async (eventId: string, aid: string, memberId: string) =>
          client.admin.events.removeAssignmentMember.mutate({ eventId, aid, memberId }),
      },
      volunteers: {
        create: async (eventId: string, body: { name: string; department: string }) =>
          client.admin.events.createVolunteer.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          vid: string,
          body: { name?: string; department?: string }
        ) => client.admin.events.updateVolunteer.mutate({ eventId, vid, ...body }),
        delete: async (eventId: string, vid: string) =>
          client.admin.events.deleteVolunteer.mutate({ eventId, vid }),
      },
      scheduleItems: {
        create: async (
          eventId: string,
          body: { scheduled_time: string; label: string; location?: string }
        ) => client.admin.events.createScheduleItem.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          scheduleId: string,
          body: { scheduled_time?: string; label?: string; location?: string | null }
        ) => client.admin.events.updateScheduleItem.mutate({ eventId, scheduleId, ...body }),
        delete: async (eventId: string, scheduleId: string) =>
          client.admin.events.deleteScheduleItem.mutate({ eventId, scheduleId }),
      },
      memberAttendees: {
        add: async (
          eventId: string,
          body: { member_id: string; waiver_signed?: boolean }
        ) => client.admin.events.addMemberAttendee.mutate({ eventId, ...body }),
        update: async (
          eventId: string,
          memberAttendeeId: string,
          body: { waiver_signed?: boolean }
        ) =>
          client.admin.events.updateMemberAttendee.mutate({
            eventId,
            memberAttendeeId,
            ...body,
          }),
        delete: async (eventId: string, memberAttendeeId: string) =>
          client.admin.events.deleteMemberAttendee.mutate({ eventId, memberAttendeeId }),
      },
    },
    budgets: {
      list: () => client.admin.budgets.list.query(),
      get: (id: string) => client.admin.budgets.get.query({ id }),
      create: (body: { name: string; year: number; description?: string }) =>
        client.admin.budgets.create.mutate(body),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.budgets.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.budgets.delete.mutate({ id }),
      addLineItem: (budgetId: string, body: Record<string, unknown>) =>
        client.admin.budgets.addLineItem.mutate({ budgetId, ...body } as never),
      updateLineItem: (budgetId: string, itemId: string, body: Record<string, unknown>) =>
        client.admin.budgets.updateLineItem.mutate({ budgetId, itemId, ...body } as never),
      deleteLineItem: (budgetId: string, itemId: string) =>
        client.admin.budgets.deleteLineItem.mutate({ budgetId, itemId }),
    },
    members: {
      list: () => client.admin.members.list.query(),
      get: (id: string) => client.admin.members.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.members.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.members.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.members.delete.mutate({ id }),
      getPhoto: (id: string, size?: string) =>
        client.admin.members.getPhoto.query({ id, size: size as "thumbnail" | "medium" | "full" }).then((b64) => (b64 ? new Uint8Array(Buffer.from(b64, "base64")) : null)),
    },
    scenarios: {
      list: () => client.admin.scenarios.list.query(),
      get: (id: string) => client.admin.scenarios.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.scenarios.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.scenarios.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.scenarios.delete.mutate({ id }),
    },
    contacts: {
      list: (params?: Record<string, unknown>) => client.admin.contacts.list.query(params as never),
      get: (id: string) => client.admin.contacts.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.contacts.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.contacts.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.contacts.delete.mutate({ id }),
      restore: (id: string) => client.admin.contacts.restore.mutate({ id }),
    },
    mailingLists: {
      list: () => client.admin.mailingLists.list.query(),
      get: (id: string) => client.admin.mailingLists.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.mailingLists.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.mailingLists.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.mailingLists.delete.mutate({ id }),
      getMembers: (listId: string) => client.admin.mailingLists.getMembers.query({ listId }),
      addMember: (listId: string, contactId: string) =>
        client.admin.mailingLists.addMember.mutate({ listId, contactId }),
      removeMember: (listId: string, contactId: string) =>
        client.admin.mailingLists.removeMember.mutate({ listId, contactId }),
      preview: (id: string) => client.admin.mailingLists.preview.query({ id }),
      getStats: (id: string) => client.admin.mailingLists.getStats.query({ id }),
    },
    mailingBatches: {
      list: () => client.admin.mailingBatches.list.query(),
      get: (id: string) => client.admin.mailingBatches.get.query({ id }),
      create: (listId: string, name: string) =>
        client.admin.mailingBatches.create.mutate({ listId, name }),
      updateRecipientStatus: (batchId: string, recipientId: string, status: string, reason?: string) =>
        client.admin.mailingBatches.updateRecipientStatus.mutate({
          batchId,
          recipientId,
          status,
          reason,
        }),
    },
    qrCodes: {
      list: () => client.admin.qrCodes.list.query(),
      get: (id: string) => client.admin.qrCodes.get.query({ id }),
      getImageUrl: async (id: string, size?: number) => {
        const r = await client.admin.qrCodes.getImage.query({ id, size });
        return `data:${r.contentType};base64,${r.base64}`;
      },
      create: (body: Record<string, unknown>) => client.admin.qrCodes.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.qrCodes.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.qrCodes.delete.mutate({ id }),
    },
    meetings: {
      list: (sort?: string) => client.admin.meetings.list.query(sort ? { sort: sort as "date" | "meeting_number" } : undefined),
      get: (id: string) => client.admin.meetings.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.meetings.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.meetings.update.mutate({ id, ...body } as never),
      delete: (id: string, deleteAgenda?: boolean, deleteMinutes?: boolean) =>
        client.admin.meetings.delete.mutate({ id, delete_agenda: deleteAgenda, delete_minutes: deleteMinutes }),
    },
    meetingTemplates: {
      list: (type?: string) =>
        client.admin.meetingTemplates.list.query(type ? { type: type as "agenda" | "minutes" } : undefined),
      get: (id: string) => client.admin.meetingTemplates.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.meetingTemplates.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.meetingTemplates.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.meetingTemplates.delete.mutate({ id }),
    },
    documents: {
      get: (id: string) => client.admin.documents.get.query({ id }),
      update: (id: string, body: { content: string }) =>
        client.admin.documents.update.mutate({ id, content: body.content }),
      getVersions: (id: string) => client.admin.documents.getVersions.query({ id }),
      restore: (id: string, versionId: string) =>
        client.admin.documents.restore.mutate({ id, versionId }),
      exportPdf: async (id: string, filename: string) => {
        const { base64 } = await client.admin.documents.exportPdf.query({ id });
        const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const blob = new Blob([bin], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    committees: {
      list: (sort?: string) =>
        client.admin.committees.list.query(sort ? { sort: sort as "formed_date" | "name" } : undefined),
      get: (id: string) => client.admin.committees.get.query({ id }),
      create: (body: Record<string, unknown>) => client.admin.committees.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        client.admin.committees.update.mutate({ id, ...body } as never),
      delete: (id: string) => client.admin.committees.delete.mutate({ id }),
      addMember: (committeeId: string, memberId: string) =>
        client.admin.committees.addMember.mutate({ committeeId, memberId }),
      removeMember: (committeeId: string, memberId: string) =>
        client.admin.committees.removeMember.mutate({ committeeId, memberId }),
      reorderMembers: (committeeId: string, memberIds: string[]) =>
        client.admin.committees.reorderMembers.mutate({ committeeId, memberIds }),
      listMeetings: (committeeId: string) =>
        client.admin.committees.listMeetings.query({ committeeId }),
      createMeeting: (committeeId: string, body: Record<string, unknown>) =>
        client.admin.committees.createMeeting.mutate({ committeeId, ...body } as never),
      getMeeting: (committeeId: string, meetingId: string) =>
        client.admin.committees.getMeeting.query({ committeeId, meetingId }),
      updateMeeting: (committeeId: string, meetingId: string, body: Record<string, unknown>) =>
        client.admin.committees.updateMeeting.mutate({ committeeId, meetingId, ...body } as never),
      deleteMeeting: (committeeId: string, meetingId: string) =>
        client.admin.committees.deleteMeeting.mutate({ committeeId, meetingId }),
    },
    website: {
      getEventsFeed: () => client.website.getEventsFeed.query(),
      getMembersFeed: () => client.website.getMembersFeed.query(),
      getBlogPublished: () => client.website.getBlogPublished.query(),
      getBlogBySlug: (slug: string) => client.website.getBlogBySlug.query({ slug }),
      getPages: () => client.website.getPages.query(),
      getPageBySlug: (slug: string) => client.website.getPageBySlug.query({ slug }),
      getPageById: (id: string) => client.website.getPageById.query({ id }),
      listPages: () => client.admin.website.listPages.query(),
      createPage: (body: Record<string, unknown>) => client.admin.website.createPage.mutate(body as never),
      updatePage: (id: string, body: Record<string, unknown>) =>
        client.admin.website.updatePage.mutate({ id, ...body } as never),
      deletePage: (id: string) => client.admin.website.deletePage.mutate({ id }),
      listBlogAll: () => client.admin.website.listBlogAll.query(),
      getBlogById: (id: string) => client.admin.website.getBlogById.query({ id }),
      createBlogPost: (body: Record<string, unknown>) => client.admin.website.createBlogPost.mutate(body as never),
      updateBlogPost: (id: string, body: Record<string, unknown>) =>
        client.admin.website.updateBlogPost.mutate({ id, ...body } as never),
      deleteBlogPost: (id: string) => client.admin.website.deleteBlogPost.mutate({ id }),
      getMenus: () => client.admin.website.getMenus.query(),
      updateMenu: (key: string, items: unknown[]) =>
        client.admin.website.updateMenu.mutate({ key, items }),
      getSettings: () => client.admin.website.getSettings.query(),
      updateSettings: (body: Record<string, unknown>) =>
        client.admin.website.updateSettings.mutate(body as never),
      listContactSubmissions: () => client.admin.website.listContactSubmissions.query(),
      listContactMemberSubmissions: () => client.admin.website.listContactMemberSubmissions.query(),
    },
  };
}

export function useApi() {
  const client = useTrpcClient();
  return useMemo(() => buildApi(client), [client]);
}
