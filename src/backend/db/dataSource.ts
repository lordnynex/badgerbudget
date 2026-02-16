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
  AuditLog,
} from "../entities";

const projectRoot = join(import.meta.dir, "../..");
const dbPath = join(projectRoot, "data", "badger.db");

const dataSourceOptions: DataSourceOptions = {
  name: "badger",
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

// Use global to persist DataSource across hot reloads (avoids "connection already established" error)
const globalForDataSource = globalThis as unknown as { __badgerDataSource?: DataSource };
export const dataSource =
  globalForDataSource.__badgerDataSource ?? (globalForDataSource.__badgerDataSource = new DataSource(dataSourceOptions));
