import { DataSource } from "typeorm";
import type { DataSourceOptions } from "typeorm";
import { join } from "path";
import {
  Document,
  DocumentVersion,
  Event,
  EventPhoto,
  EventAttendee,
  EventRideMemberAttendee,
  EventAsset,
  RideScheduleItem,
  EventPlanningMilestone,
  EventMilestoneMember,
  EventPackingCategory,
  EventPackingItem,
  EventVolunteer,
  EventAssignment,
  EventAssignmentMember,
  Budget,
  LineItem,
  Scenario,
  Member,
  Contact,
  ContactEmail,
  ContactPhone,
  ContactAddress,
  ContactNote,
  ContactEmergencyContact,
  ContactPhoto,
  Tag,
  ContactTag,
  MailingList,
  MailingListMember,
  MailingBatch,
  MailingBatchRecipient,
  QrCode,
  Meeting,
  MeetingMotion,
  MeetingActionItem,
  OldBusinessItem,
  MeetingTemplate,
  Committee,
  CommitteeMember,
  CommitteeMeeting,
  SitePage,
  SiteSettings,
  SiteMenuItem,
  BlogPost,
  ContactSubmission,
  ContactMemberSubmission,
  Incident,
} from "../entities";
import { InitialSchema1700000000000 } from "./migrations/1700000000000-InitialSchema.ts";
import { AddMemberPhotoThumbnail1739750400000 } from "./migrations/1739750400000-AddMemberPhotoThumbnail.ts";
import { RemoveAuditLog1739900000000 } from "./migrations/1739900000000-RemoveAuditLog.ts";
import { AddMailingListDeliveryType1740000000000 } from "./migrations/1740000000000-AddMailingListDeliveryType.ts";
import { AddContactNotesTable1740000001000 } from "./migrations/1740000001000-AddContactNotesTable.ts";
import { AddContactPhotosTable1740000002000 } from "./migrations/1740000002000-AddContactPhotosTable.ts";
import { AddQrCodesTable1740000003000 } from "./migrations/1740000003000-AddQrCodesTable.ts";
import { AddContactHellenicDeceased1740000004000 } from "./migrations/1740000004000-AddContactHellenicDeceased.ts";
import { AddContactEmergencyContactsTable1740000005000 } from "./migrations/1740000005000-AddContactEmergencyContactsTable.ts";
import { AddContactOkToSms1740000006000 } from "./migrations/1740000006000-AddContactOkToSms.ts";
import { AddEventType1740000007000 } from "./migrations/1740000007000-AddEventType.ts";
import { AddEventPhotosTable1740000007500 } from "./migrations/1740000007500-AddEventPhotosTable.ts";
import { AddRideFieldsAndAttendeesAssets1740000008000 } from "./migrations/1740000008000-AddRideFieldsAndAttendeesAssets.ts";
import { AddEventRideMemberAttendees1740000009000 } from "./migrations/1740000009000-AddEventRideMemberAttendees.ts";
import { AddMeetingsAndRelated1740000010000 } from "./migrations/1740000010000-AddMeetingsAndRelated.ts";
import { AddDocumentsTable1740000011000 } from "./migrations/1740000011000-AddDocumentsTable.ts";
import { AddMotionMoverSeconder1740000012000 } from "./migrations/1740000012000-AddMotionMoverSeconder.ts";
import { AddCommittees1740000013000 } from "./migrations/1740000013000-AddCommittees.ts";
import { AddMeetingTimesAndVideoUrl1740000014000 } from "./migrations/1740000014000-AddMeetingTimesAndVideoUrl.ts";
import { AddWebsiteTables1740000015000 } from "./migrations/1740000015000-AddWebsiteTables.ts";
import { AddShowOnWebsite1740000016000 } from "./migrations/1740000016000-AddShowOnWebsite.ts";
import { AddSiteMenuItems1740000017000 } from "./migrations/1740000017000-AddSiteMenuItems.ts";
import { AddBlogPosts1740000018000 } from "./migrations/1740000018000-AddBlogPosts.ts";
import { AddContactSubmissions1740000019000 } from "./migrations/1740000019000-AddContactSubmissions.ts";
import { AddIncidents1740000020000 } from "./migrations/1740000020000-AddIncidents.ts";

export function getProjectRoot(): string {
  return process.env.DATA_DIR ?? join(import.meta.dir, "../../../..");
}

const projectRoot = getProjectRoot();
const dbPath = join(projectRoot, "data", "badger.db");

export const dataSourceOptions: DataSourceOptions = {
  name: "badger",
  type: "sqljs",
  location: dbPath,
  autoSave: true,
  synchronize: false,
  migrations: [
    InitialSchema1700000000000,
    AddMemberPhotoThumbnail1739750400000,
    RemoveAuditLog1739900000000,
    AddMailingListDeliveryType1740000000000,
    AddContactNotesTable1740000001000,
    AddContactPhotosTable1740000002000,
    AddQrCodesTable1740000003000,
    AddContactHellenicDeceased1740000004000,
    AddContactEmergencyContactsTable1740000005000,
    AddContactOkToSms1740000006000,
    AddEventType1740000007000,
    AddEventPhotosTable1740000007500,
    AddRideFieldsAndAttendeesAssets1740000008000,
    AddEventRideMemberAttendees1740000009000,
    AddMeetingsAndRelated1740000010000,
    AddDocumentsTable1740000011000,
    AddMotionMoverSeconder1740000012000,
    AddCommittees1740000013000,
    AddMeetingTimesAndVideoUrl1740000014000,
    AddWebsiteTables1740000015000,
    AddShowOnWebsite1740000016000,
    AddSiteMenuItems1740000017000,
    AddBlogPosts1740000018000,
    AddContactSubmissions1740000019000,
    AddIncidents1740000020000,
  ],
  migrationsRun: true,
  entities: [
    Event,
    EventPhoto,
    EventAttendee,
    EventRideMemberAttendee,
    EventAsset,
    RideScheduleItem,
    EventPlanningMilestone,
    EventMilestoneMember,
    EventPackingCategory,
    EventPackingItem,
    EventVolunteer,
    EventAssignment,
    EventAssignmentMember,
    Budget,
    LineItem,
    Scenario,
    Member,
    Contact,
    ContactEmail,
    ContactPhone,
    ContactAddress,
    ContactNote,
    ContactEmergencyContact,
    ContactPhoto,
    Tag,
    ContactTag,
    MailingList,
    MailingListMember,
    MailingBatch,
    MailingBatchRecipient,
    QrCode,
    Document,
    DocumentVersion,
    Meeting,
    MeetingMotion,
    MeetingActionItem,
    OldBusinessItem,
    MeetingTemplate,
    Committee,
    CommitteeMember,
    CommitteeMeeting,
    SitePage,
    SiteSettings,
    SiteMenuItem,
    BlogPost,
    ContactSubmission,
    ContactMemberSubmission,
    Incident,
  ],
};

const globalForDataSource = globalThis as unknown as {
  __badgerDataSource?: DataSource;
  __badgerInitPromise?: Promise<DataSource>;
};

/**
 * Returns the single DataSource instance. Initializes it once; all callers share the same instance.
 * Do not use createConnection or getConnectionManager - this is the only connection.
 */
export async function getDataSource(): Promise<DataSource> {
  if (globalForDataSource.__badgerDataSource?.isInitialized) {
    return globalForDataSource.__badgerDataSource;
  }
  if (!globalForDataSource.__badgerInitPromise) {
    const ds = new DataSource(dataSourceOptions);
    globalForDataSource.__badgerDataSource = ds;
    globalForDataSource.__badgerInitPromise = ds.initialize().then(() => ds);
  }
  return globalForDataSource.__badgerInitPromise;
}
