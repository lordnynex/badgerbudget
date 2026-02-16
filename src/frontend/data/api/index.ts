import { EventsApiClient } from "./EventsApiClient";
import { BudgetsApiClient } from "./BudgetsApiClient";
import { MembersApiClient } from "./MembersApiClient";
import { ScenariosApiClient } from "./ScenariosApiClient";
import { ContactsApiClient } from "./ContactsApiClient";
import { MailingListsApiClient } from "./MailingListsApiClient";
import { MailingBatchesApiClient } from "./MailingBatchesApiClient";

const events = new EventsApiClient();
const budgets = new BudgetsApiClient();
const members = new MembersApiClient();
const scenarios = new ScenariosApiClient();
const contacts = new ContactsApiClient();
const mailingLists = new MailingListsApiClient();
const mailingBatches = new MailingBatchesApiClient();

/**
 * Composed API client mirroring backend service structure.
 * Each domain (events, budgets, members, etc.) has its own class.
 */
export const api = {
  events,
  budgets,
  members,
  scenarios,
  contacts,
  mailingLists,
  mailingBatches,
};

export { client, unwrap, buildSearchParams } from "./client";
