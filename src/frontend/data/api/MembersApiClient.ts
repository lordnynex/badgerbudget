import { client, getErrorMessage } from "./client";
import type { Member } from "@/types/budget";

export type CreateMemberBody = {
  name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  birthday?: string;
  member_since?: string;
  is_baby?: boolean;
  position?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  photo?: string;
};

async function unwrapMembersResponse<T>(
  promise: Promise<{ data?: unknown; error?: unknown; status: number }>,
): Promise<T> {
  const res = await promise;
  if (res.error) throw new Error(getErrorMessage(res.error, res.status));
  const data = res.data;
  if (data instanceof Response) return data.json() as Promise<T>;
  return data as T;
}

export class MembersApiClient {
  list(): Promise<Member[]> {
    return unwrapMembersResponse<Member[]>(client.api.members.get());
  }

  get(id: string): Promise<Member> {
    return unwrapMembersResponse<Member>(client.api.members({ id }).get());
  }

  create(body: CreateMemberBody) {
    return unwrapMembersResponse<Member>(client.api.members.post(body));
  }

  update(id: string, body: Record<string, unknown>) {
    return unwrapMembersResponse<Member>(client.api.members({ id }).put(body));
  }

  delete(id: string) {
    return unwrapMembersResponse<{ ok: boolean }>(
      client.api.members({ id }).delete(),
    );
  }
}
