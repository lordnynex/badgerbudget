import { DataSource } from "typeorm";
import type { DataSourceOptions } from "typeorm";
import { join } from "path";
import {
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

const projectRoot = join(import.meta.dir, "../../..");
const dbPath = join(projectRoot, "data", "badger.db");

const dataSourceOptions: DataSourceOptions = {
  name: "badger",
  type: "sqljs",
  location: dbPath,
  autoSave: true,
  synchronize: false,
  migrations: [InitialSchema1700000000000, AddMemberPhotoThumbnail1739750400000, RemoveAuditLog1739900000000, AddMailingListDeliveryType1740000000000, AddContactNotesTable1740000001000, AddContactPhotosTable1740000002000, AddQrCodesTable1740000003000, AddContactHellenicDeceased1740000004000, AddContactEmergencyContactsTable1740000005000, AddContactOkToSms1740000006000, AddEventType1740000007000, AddEventPhotosTable1740000007500, AddRideFieldsAndAttendeesAssets1740000008000, AddEventRideMemberAttendees1740000009000, AddMeetingsAndRelated1740000010000],
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
    Meeting,
    MeetingMotion,
    MeetingActionItem,
    OldBusinessItem,
    MeetingTemplate,
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
