import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTrpcClient, type TrpcClient } from "./trpcClientContext";
import { EventsApiClient } from "./EventsApiClient";
import { BudgetsApiClient } from "./BudgetsApiClient";
import { MembersApiClient } from "./MembersApiClient";
import { ScenariosApiClient } from "./ScenariosApiClient";
import { ContactsApiClient } from "./ContactsApiClient";
import { MailingListsApiClient } from "./MailingListsApiClient";
import { MailingBatchesApiClient } from "./MailingBatchesApiClient";
import { QrCodesApiClient } from "./QrCodesApiClient";
import { MeetingsApiClient } from "./MeetingsApiClient";
import { MeetingTemplatesApiClient } from "./MeetingTemplatesApiClient";
import { DocumentsApiClient } from "./DocumentsApiClient";
import { CommitteesApiClient } from "./CommitteesApiClient";
import { WebsiteApiClient } from "./WebsiteApiClient";
import { IncidentsApiClient } from "./IncidentsApiClient";

export type { TrpcClient } from "./trpcClientContext";

export type Api = ReturnType<typeof buildApi>;

export function buildApi(client: TrpcClient) {
  return {
    events: new EventsApiClient(client),
    budgets: new BudgetsApiClient(client),
    members: new MembersApiClient(client),
    scenarios: new ScenariosApiClient(client),
    contacts: new ContactsApiClient(client),
    mailingLists: new MailingListsApiClient(client),
    mailingBatches: new MailingBatchesApiClient(client),
    qrCodes: new QrCodesApiClient(client),
    meetings: new MeetingsApiClient(client),
    meetingTemplates: new MeetingTemplatesApiClient(client),
    documents: new DocumentsApiClient(client),
    committees: new CommitteesApiClient(client),
    website: new WebsiteApiClient(client),
    incidents: new IncidentsApiClient(client),
  };
}

const ApiContext = createContext<Api | null>(null);

export function ApiProvider({ api, children }: { api: Api; children: ReactNode }) {
  return React.createElement(ApiContext.Provider, { value: api }, children);
}

export function useApi(): Api {
  const injected = useContext(ApiContext);
  if (injected) return injected;
  const client = useTrpcClient();
  return useMemo(() => buildApi(client), [client]);
}

export { TrpcClientProvider, useTrpcClient } from "./trpcClientContext";
export { createMockApi } from "./mockApi";

/** Pass-through for code that used to unwrap Eden responses. tRPC throws on error so we just return the value. */
export async function unwrap<T>(promise: Promise<T>): Promise<T> {
  return promise;
}

export function getErrorMessage(err: unknown, status: number): string {
  if (err instanceof Error) return err.message;
  return `Request failed (${status})`;
}

export type { CreateMemberBody } from "./MembersApiClient";
