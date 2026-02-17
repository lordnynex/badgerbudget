import { DataSource } from "typeorm";
import type { DataSourceOptions } from "typeorm";
import { join } from "path";
import {
  Event,
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
  Tag,
  ContactTag,
  MailingList,
  MailingListMember,
  MailingBatch,
  MailingBatchRecipient,
} from "../entities";
import { InitialSchema1700000000000 } from "./migrations/1700000000000-InitialSchema.ts";
import { AddMemberPhotoThumbnail1739750400000 } from "./migrations/1739750400000-AddMemberPhotoThumbnail.ts";
import { RemoveAuditLog1739900000000 } from "./migrations/1739900000000-RemoveAuditLog.ts";
import { AddMailingListDeliveryType1740000000000 } from "./migrations/1740000000000-AddMailingListDeliveryType.ts";

const projectRoot = join(import.meta.dir, "../../..");
const dbPath = join(projectRoot, "data", "badger.db");

const dataSourceOptions: DataSourceOptions = {
  name: "badger",
  type: "sqljs",
  location: dbPath,
  autoSave: true,
  synchronize: false,
  migrations: [InitialSchema1700000000000, AddMemberPhotoThumbnail1739750400000, RemoveAuditLog1739900000000, AddMailingListDeliveryType1740000000000],
  migrationsRun: true,
  entities: [
    Event,
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
    Tag,
    ContactTag,
    MailingList,
    MailingListMember,
    MailingBatch,
    MailingBatchRecipient,
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
