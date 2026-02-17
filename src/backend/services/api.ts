import type { DataSource } from "typeorm";
import type { DbLike } from "../db/dbAdapter";
import { EventsService } from "./EventsService";
import { BudgetsService } from "./BudgetsService";
import { MembersService } from "./MembersService";
import { ScenariosService } from "./ScenariosService";
import { ContactsService } from "./ContactsService";
import { MailingListsService } from "./MailingListsService";
import { MailingBatchesService } from "./MailingBatchesService";

export function createApi(db: DbLike, ds: DataSource) {
  const eventsService = new EventsService(db, ds);
  const budgetsService = new BudgetsService(db, ds);
  const membersService = new MembersService(db, ds);
  const scenariosService = new ScenariosService(db, ds);
  const contactsService = new ContactsService(db, ds);
  const mailingListsService = new MailingListsService(db, ds, contactsService);
  const mailingBatchesService = new MailingBatchesService(db, ds, mailingListsService);

  return {
    events: eventsService,
    budgets: budgetsService,
    members: membersService,
    scenarios: scenariosService,
    contacts: contactsService,
    mailingLists: mailingListsService,
    mailingBatches: mailingBatchesService,
  };
}

export type Api = ReturnType<typeof createApi>;
