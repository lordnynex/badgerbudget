import { client, unwrap } from "./client";
import type { MeetingTemplate } from "@/shared/types/meeting";

export class MeetingTemplatesApiClient {
  list(options?: { type?: "agenda" | "minutes" }) {
    return unwrap(
      client.api["meeting-templates"].get(
        options?.type ? { query: { type: options.type } } : undefined
      )
    ) as Promise<MeetingTemplate[]>;
  }

  get(id: string) {
    return unwrap(client.api["meeting-templates"]({ id }).get()) as Promise<MeetingTemplate | null>;
  }

  create(body: { name: string; type: "agenda" | "minutes"; content: string }) {
    return unwrap(client.api["meeting-templates"].post(body)) as Promise<MeetingTemplate>;
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrap(client.api["meeting-templates"]({ id }).put(body)) as Promise<MeetingTemplate>;
  }

  delete(id: string) {
    return unwrap(client.api["meeting-templates"]({ id }).delete()) as Promise<{ ok: boolean }>;
  }
}
