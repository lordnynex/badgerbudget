import { client, unwrap } from "./client";

export class MailingBatchesApiClient {
  list() {
    return unwrap(client.api["mailing-batches"].get());
  }

  get(id: string) {
    return unwrap(client.api["mailing-batches"]({ id }).get());
  }

  create(listId: string, name: string) {
    return unwrap(
      client.api["mailing-batches"].post({ list_id: listId, name }),
    );
  }

  updateRecipientStatus(
    batchId: string,
    recipientId: string,
    status: string,
    reason?: string,
  ) {
    return unwrap(
      client.api
        ["mailing-batches"]({ id: batchId })
        .recipients({ recipientId })
        .put({ status, reason }),
    );
  }
}
