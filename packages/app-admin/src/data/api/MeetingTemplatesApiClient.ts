import type { TrpcClient } from "./trpcClientContext";
import type { MeetingTemplate } from "@badgerbudget/shared/types/meeting";

export class MeetingTemplatesApiClient {
  constructor(private client: TrpcClient) {}

  list(options?: { type?: "agenda" | "minutes" }) {
    return this.client.admin.meetingTemplates.list.query(
      options?.type ? { type: options.type } : undefined
    ) as Promise<MeetingTemplate[]>;
  }

  get(id: string): Promise<MeetingTemplate | null> {
    return this.client.admin.meetingTemplates.get
      .query({ id })
      .catch(() => null) as Promise<MeetingTemplate | null>;
  }

  create(body: {
    name: string;
    type: "agenda" | "minutes";
    content: string;
  }) {
    return this.client.admin.meetingTemplates.create.mutate(body);
  }

  update(id: string, body: Record<string, unknown>) {
    return this.client.admin.meetingTemplates.update.mutate({
      id,
      ...body,
    } as never);
  }

  delete(id: string) {
    return this.client.admin.meetingTemplates.delete.mutate({ id });
  }
}
