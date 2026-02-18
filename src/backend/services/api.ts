import type { DataSource } from "typeorm";
import type { DbLike } from "../db/dbAdapter";
import { EventsService } from "./EventsService";
import { BudgetsService } from "./BudgetsService";
import { MembersService } from "./MembersService";
import { ScenariosService } from "./ScenariosService";
import { ContactsService } from "./ContactsService";
import { MailingListsService } from "./MailingListsService";
import { MailingBatchesService } from "./MailingBatchesService";
import { QrCodesService } from "./QrCodesService";
import { MeetingsService } from "./MeetingsService";
import { MeetingTemplatesService } from "./MeetingTemplatesService";

export function createApi(db: DbLike, ds: DataSource) {
  const eventsService = new EventsService(db, ds);
  const budgetsService = new BudgetsService(db, ds);
  const membersService = new MembersService(db, ds);
  const scenariosService = new ScenariosService(db, ds);
  const contactsService = new ContactsService(db, ds);
  const mailingListsService = new MailingListsService(db, ds, contactsService);
  const mailingBatchesService = new MailingBatchesService(db, ds, mailingListsService);
  const qrCodesService = new QrCodesService(ds);
  const meetingsService = new MeetingsService(ds);
  const meetingTemplatesService = new MeetingTemplatesService(ds);

  return {
    events: eventsService,
    budgets: budgetsService,
    members: membersService,
    scenarios: scenariosService,
    contacts: contactsService,
    mailingLists: mailingListsService,
    mailingBatches: mailingBatchesService,
    qrCodes: qrCodesService,
    meetings: meetingsService,
    meetingTemplates: meetingTemplatesService,
  };
}

export type Api = ReturnType<typeof createApi>;
