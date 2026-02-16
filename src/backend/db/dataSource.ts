import type { DataSource } from "typeorm";
import { createConnection } from "typeorm";
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

const projectRoot = join(import.meta.dir, "../../..");
const dbPath = join(projectRoot, "data", "badger.db");

const dataSourceOptions: DataSourceOptions = {
  name: "default",
  type: "sqljs",
  location: dbPath,
  autoSave: true,
  synchronize: false,
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
  if (!globalForDataSource.__badgerDataSourcePromise) {
    globalForDataSource.__badgerDataSourcePromise = createConnection(dataSourceOptions);
  }
  return globalForDataSource.__badgerDataSourcePromise;
}
