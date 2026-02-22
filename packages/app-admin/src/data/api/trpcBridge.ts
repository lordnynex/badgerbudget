/**
 * API bridge that delegates to the tRPC client.
 * Uses getTrpcClient() which is set when the provider mounts.
 */
import { getTrpcClient } from "./trpcRef";

function c() {
  return getTrpcClient();
}

export const api = {
  get events() {
    return {
      list: (opts?: { type?: string }) =>
        c().admin.events.list.query(opts?.type ? { type: opts.type } : undefined),
      get: (id: string) => c().admin.events.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.events.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.events.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.events.delete.mutate({ id }),
      photos: {
        add: async (_eventId: string, _file: File) => {
          throw new Error("events.photos.add not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _photoId: string) => {
          throw new Error("events.photos.delete not yet migrated to tRPC");
        },
      },
      assets: {
        add: async (_eventId: string, _file: File) => {
          throw new Error("events.assets.add not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _assetId: string) => {
          throw new Error("events.assets.delete not yet migrated to tRPC");
        },
      },
      attendees: {
        add: async (_eventId: string, _body: unknown) => {
          throw new Error("events.attendees.add not yet migrated to tRPC");
        },
        update: async (_eventId: string, _attendeeId: string, _body: unknown) => {
          throw new Error("events.attendees.update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _attendeeId: string) => {
          throw new Error("events.attendees.delete not yet migrated to tRPC");
        },
      },
      milestones: {
        create: async (_eventId: string, _body: unknown) => {
          throw new Error("events.milestones.create not yet migrated to tRPC");
        },
        update: async (_eventId: string, _mid: string, _body: unknown) => {
          throw new Error("events.milestones.update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _mid: string) => {
          throw new Error("events.milestones.delete not yet migrated to tRPC");
        },
      },
      packingCategories: {
        create: async (_eventId: string, _body: unknown) => {
          throw new Error("events.packingCategories not yet migrated to tRPC");
        },
        update: async (_eventId: string, _cid: string, _body: unknown) => {
          throw new Error("events.packingCategories update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _cid: string) => {
          throw new Error("events.packingCategories delete not yet migrated to tRPC");
        },
      },
      packingItems: {
        create: async (_eventId: string, _body: unknown) => {
          throw new Error("events.packingItems not yet migrated to tRPC");
        },
        update: async (_eventId: string, _pid: string, _body: unknown) => {
          throw new Error("events.packingItems update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _pid: string) => {
          throw new Error("events.packingItems delete not yet migrated to tRPC");
        },
      },
      assignments: {
        create: async (_eventId: string, _body: unknown) => {
          throw new Error("events.assignments not yet migrated to tRPC");
        },
        update: async (_eventId: string, _aid: string, _body: unknown) => {
          throw new Error("events.assignments update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _aid: string) => {
          throw new Error("events.assignments delete not yet migrated to tRPC");
        },
      },
      volunteers: {
        create: async (_eventId: string, _body: unknown) => {
          throw new Error("events.volunteers not yet migrated to tRPC");
        },
        update: async (_eventId: string, _vid: string, _body: unknown) => {
          throw new Error("events.volunteers update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _vid: string) => {
          throw new Error("events.volunteers delete not yet migrated to tRPC");
        },
      },
      scheduleItems: {
        create: async (_eventId: string, _body: unknown) => {
          throw new Error("events.scheduleItems not yet migrated to tRPC");
        },
        update: async (_eventId: string, _sid: string, _body: unknown) => {
          throw new Error("events.scheduleItems update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _sid: string) => {
          throw new Error("events.scheduleItems delete not yet migrated to tRPC");
        },
      },
      memberAttendees: {
        add: async (_eventId: string, _body: unknown) => {
          throw new Error("events.memberAttendees not yet migrated to tRPC");
        },
        update: async (_eventId: string, _aid: string, _body: unknown) => {
          throw new Error("events.memberAttendees update not yet migrated to tRPC");
        },
        delete: async (_eventId: string, _aid: string) => {
          throw new Error("events.memberAttendees delete not yet migrated to tRPC");
        },
      },
    };
  },
  get budgets() {
    return {
      list: () => c().admin.budgets.list.query(),
      get: (id: string) => c().admin.budgets.get.query({ id }),
      create: (body: { name: string; year: number; description?: string }) =>
        c().admin.budgets.create.mutate(body),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.budgets.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.budgets.delete.mutate({ id }),
      addLineItem: (budgetId: string, body: Record<string, unknown>) =>
        c().admin.budgets.addLineItem.mutate({ budgetId, ...body } as never),
      updateLineItem: (budgetId: string, itemId: string, body: Record<string, unknown>) =>
        c().admin.budgets.updateLineItem.mutate({ budgetId, itemId, ...body } as never),
      deleteLineItem: (budgetId: string, itemId: string) =>
        c().admin.budgets.deleteLineItem.mutate({ budgetId, itemId }),
    };
  },
  get members() {
    return {
      list: () => c().admin.members.list.query(),
      get: (id: string) => c().admin.members.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.members.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.members.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.members.delete.mutate({ id }),
      getPhoto: (id: string, size?: string) =>
        c().admin.members.getPhoto.query({ id, size: size as "thumbnail" | "medium" | "full" }).then((b64) => (b64 ? new Uint8Array(Buffer.from(b64, "base64")) : null)),
    };
  },
  get scenarios() {
    return {
      list: () => c().admin.scenarios.list.query(),
      get: (id: string) => c().admin.scenarios.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.scenarios.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.scenarios.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.scenarios.delete.mutate({ id }),
    };
  },
  get contacts() {
    return {
      list: (params?: Record<string, unknown>) => c().admin.contacts.list.query(params as never),
      get: (id: string) => c().admin.contacts.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.contacts.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.contacts.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.contacts.delete.mutate({ id }),
      restore: (id: string) => c().admin.contacts.restore.mutate({ id }),
    };
  },
  get mailingLists() {
    return {
      list: () => c().admin.mailingLists.list.query(),
      get: (id: string) => c().admin.mailingLists.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.mailingLists.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.mailingLists.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.mailingLists.delete.mutate({ id }),
      getMembers: (listId: string) => c().admin.mailingLists.getMembers.query({ listId }),
      addMember: (listId: string, contactId: string) =>
        c().admin.mailingLists.addMember.mutate({ listId, contactId }),
      removeMember: (listId: string, contactId: string) =>
        c().admin.mailingLists.removeMember.mutate({ listId, contactId }),
      preview: (id: string) => c().admin.mailingLists.preview.query({ id }),
      getStats: (id: string) => c().admin.mailingLists.getStats.query({ id }),
    };
  },
  get mailingBatches() {
    return {
      list: () => c().admin.mailingBatches.list.query(),
      get: (id: string) => c().admin.mailingBatches.get.query({ id }),
      create: (listId: string, name: string) =>
        c().admin.mailingBatches.create.mutate({ listId, name }),
      updateRecipientStatus: (batchId: string, recipientId: string, status: string, reason?: string) =>
        c().admin.mailingBatches.updateRecipientStatus.mutate({
          batchId,
          recipientId,
          status,
          reason,
        }),
    };
  },
  get qrCodes() {
    return {
      list: () => c().admin.qrCodes.list.query(),
      get: (id: string) => c().admin.qrCodes.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.qrCodes.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.qrCodes.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.qrCodes.delete.mutate({ id }),
    };
  },
  get meetings() {
    return {
      list: (sort?: string) => c().admin.meetings.list.query(sort ? { sort: sort as "date" | "meeting_number" } : undefined),
      get: (id: string) => c().admin.meetings.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.meetings.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.meetings.update.mutate({ id, ...body } as never),
      delete: (id: string, deleteAgenda?: boolean, deleteMinutes?: boolean) =>
        c().admin.meetings.delete.mutate({ id, delete_agenda: deleteAgenda, delete_minutes: deleteMinutes }),
    };
  },
  get meetingTemplates() {
    return {
      list: (type?: string) =>
        c().admin.meetingTemplates.list.query(type ? { type: type as "agenda" | "minutes" } : undefined),
      get: (id: string) => c().admin.meetingTemplates.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.meetingTemplates.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.meetingTemplates.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.meetingTemplates.delete.mutate({ id }),
    };
  },
  get documents() {
    return {
      get: (id: string) => c().admin.documents.get.query({ id }),
      update: (id: string, body: { content: string }) =>
        c().admin.documents.update.mutate({ id, content: body.content }),
      getVersions: (id: string) => c().admin.documents.getVersions.query({ id }),
      restore: (id: string, versionId: string) =>
        c().admin.documents.restore.mutate({ id, versionId }),
    };
  },
  get committees() {
    return {
      list: (sort?: string) =>
        c().admin.committees.list.query(sort ? { sort: sort as "formed_date" | "name" } : undefined),
      get: (id: string) => c().admin.committees.get.query({ id }),
      create: (body: Record<string, unknown>) => c().admin.committees.create.mutate(body as never),
      update: (id: string, body: Record<string, unknown>) =>
        c().admin.committees.update.mutate({ id, ...body } as never),
      delete: (id: string) => c().admin.committees.delete.mutate({ id }),
      addMember: (committeeId: string, memberId: string) =>
        c().admin.committees.addMember.mutate({ committeeId, memberId }),
      removeMember: (committeeId: string, memberId: string) =>
        c().admin.committees.removeMember.mutate({ committeeId, memberId }),
      reorderMembers: (committeeId: string, memberIds: string[]) =>
        c().admin.committees.reorderMembers.mutate({ committeeId, memberIds }),
      listMeetings: (committeeId: string) =>
        c().admin.committees.listMeetings.query({ committeeId }),
      createMeeting: (committeeId: string, body: Record<string, unknown>) =>
        c().admin.committees.createMeeting.mutate({ committeeId, ...body } as never),
      getMeeting: (committeeId: string, meetingId: string) =>
        c().admin.committees.getMeeting.query({ committeeId, meetingId }),
      updateMeeting: (committeeId: string, meetingId: string, body: Record<string, unknown>) =>
        c().admin.committees.updateMeeting.mutate({ committeeId, meetingId, ...body } as never),
      deleteMeeting: (committeeId: string, meetingId: string) =>
        c().admin.committees.deleteMeeting.mutate({ committeeId, meetingId }),
    };
  },
  get website() {
    return {
      getEventsFeed: () => c().website.getEventsFeed.query(),
      getMembersFeed: () => c().website.getMembersFeed.query(),
      getBlogPublished: () => c().website.getBlogPublished.query(),
      getBlogBySlug: (slug: string) => c().website.getBlogBySlug.query({ slug }),
      getPages: () => c().website.getPages.query(),
      getPageBySlug: (slug: string) => c().website.getPageBySlug.query({ slug }),
      getPageById: (id: string) => c().website.getPageById.query({ id }),
      listPages: () => c().admin.website.listPages.query(),
      createPage: (body: Record<string, unknown>) => c().admin.website.createPage.mutate(body as never),
      updatePage: (id: string, body: Record<string, unknown>) =>
        c().admin.website.updatePage.mutate({ id, ...body } as never),
      deletePage: (id: string) => c().admin.website.deletePage.mutate({ id }),
      listBlogAll: () => c().admin.website.listBlogAll.query(),
      getBlogById: (id: string) => c().admin.website.getBlogById.query({ id }),
      createBlogPost: (body: Record<string, unknown>) => c().admin.website.createBlogPost.mutate(body as never),
      updateBlogPost: (id: string, body: Record<string, unknown>) =>
        c().admin.website.updateBlogPost.mutate({ id, ...body } as never),
      deleteBlogPost: (id: string) => c().admin.website.deleteBlogPost.mutate({ id }),
      getMenus: () => c().admin.website.getMenus.query(),
      updateMenu: (key: string, items: unknown[]) =>
        c().admin.website.updateMenu.mutate({ key, items }),
      getSettings: () => c().admin.website.getSettings.query(),
      updateSettings: (body: Record<string, unknown>) =>
        c().admin.website.updateSettings.mutate(body as never),
      listContactSubmissions: () => c().admin.website.listContactSubmissions.query(),
      listContactMemberSubmissions: () => c().admin.website.listContactMemberSubmissions.query(),
    };
  },
};
