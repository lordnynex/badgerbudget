import { Elysia } from "elysia";
import type { Api } from "./services/api";
import { EventsController } from "./controllers/events";
import { BudgetsController } from "./controllers/budgets";
import { MembersController } from "./controllers/members";
import { ScenariosController } from "./controllers/scenarios";
import { ContactsController } from "./controllers/contacts";
import { MailingListsController } from "./controllers/mailingLists";
import { MailingBatchesController } from "./controllers/mailingBatches";
import { QrCodesController } from "./controllers/qrCodes";
import { MeetingsController } from "./controllers/meetings";
import { MeetingTemplatesController } from "./controllers/meetingTemplates";
import { DocumentsController } from "./controllers/documents";

export function createApiRoutes(api: Api) {
  return new Elysia({ prefix: "/api" })
    .use(new EventsController(api).init())
    .use(new BudgetsController(api).init())
    .use(new MembersController(api).init())
    .use(new ScenariosController(api).init())
    .use(new ContactsController(api).init())
    .use(new MailingListsController(api).init())
    .use(new MailingBatchesController(api).init())
    .use(new QrCodesController(api).init())
    .use(new MeetingsController(api).init())
    .use(new MeetingTemplatesController(api).init())
    .use(new DocumentsController(api).init());
}
