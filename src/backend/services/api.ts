import type { DbLike } from "../db/dbAdapter";
import { EventsService } from "./EventsService";
import { BudgetsService } from "./BudgetsService";
import { MembersService } from "./MembersService";
import { ScenariosService } from "./ScenariosService";
import { ContactsService } from "./ContactsService";
import { MailingListsService } from "./MailingListsService";
import { MailingBatchesService } from "./MailingBatchesService";

export function createApi(db: DbLike) {
  const eventsService = new EventsService(db);
  const budgetsService = new BudgetsService(db);
  const membersService = new MembersService(db);
  const scenariosService = new ScenariosService(db);
  const contactsService = new ContactsService(db);
  const mailingListsService = new MailingListsService(db, contactsService);
  const mailingBatchesService = new MailingBatchesService(db, mailingListsService);

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
