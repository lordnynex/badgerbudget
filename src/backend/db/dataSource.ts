import type { DataSource } from "typeorm";
import { createConnection, getConnectionManager } from "typeorm";
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
  AuditLog,
} from "../entities";
import { InitialSchema1700000000000 } from "./migrations/1700000000000-InitialSchema.ts";

const projectRoot = join(import.meta.dir, "../../..");
const dbPath = join(projectRoot, "data", "badger.db");

const dataSourceOptions: DataSourceOptions = {
  name: "default",
  type: "sqljs",
  location: dbPath,
  autoSave: true,
  synchronize: false,
  migrations: [InitialSchema1700000000000],
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
    AuditLog,
  ],
};

const globalForDataSource = globalThis as unknown as { __badgerDataSourcePromise?: Promise<DataSource> };

export function getDataSourcePromise(): Promise<DataSource> {
  const manager = getConnectionManager();
  if (manager.has("default")) {
    return Promise.resolve(manager.get("default"));
  }
  if (!globalForDataSource.__badgerDataSourcePromise) {
    globalForDataSource.__badgerDataSourcePromise = createConnection(dataSourceOptions);
  }
  return globalForDataSource.__badgerDataSourcePromise;
}
