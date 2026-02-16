import type { DbLike } from "../db/dbAdapter";
import { createContactsApi } from "./contactsApi";
import { EventsService } from "./EventsService";
import { BudgetsService } from "./BudgetsService";
import { MembersService } from "./MembersService";
import { ScenariosService } from "./ScenariosService";

export function createApi(db: DbLike) {
  const { contacts: contactsApi, mailingLists: mailingListsApi, mailingBatches: mailingBatchesApi } =
    createContactsApi(db);

  const eventsService = new EventsService(db);
  const budgetsService = new BudgetsService(db);
  const membersService = new MembersService(db);
  const scenariosService = new ScenariosService(db);

  return {
    events: eventsService,
    budgets: budgetsService,
    members: membersService,
    scenarios: scenariosService,
    contacts: contactsApi,
    mailingLists: mailingListsApi,
    mailingBatches: mailingBatchesApi,
  };
}

export type Api = ReturnType<typeof createApi>;
