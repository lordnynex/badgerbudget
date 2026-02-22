import { client, unwrap } from "./client";
import type { QrCode, QrCodeConfig } from "@/types/qrCode";

export class QrCodesApiClient {
  async list(): Promise<QrCode[]> {
    const data = await unwrap(client.api["qr-codes"].get());
    return Array.isArray(data) ? data : [];
  }

  get(id: string) {
    return unwrap(client.api["qr-codes"]({ id }).get());
  }

  getImageUrl(id: string, size?: number): string {
    const base = `/api/qr-codes/${id}/image`;
    if (size != null && size >= 64 && size <= 2048) {
      return `${base}?size=${size}`;
    }
    return base;
  }

  create(body: { name?: string | null; url: string; config?: QrCodeConfig | null }) {
    return unwrap(client.api["qr-codes"].post(body));
  }

  update(id: string, body: { name?: string | null; url?: string; config?: QrCodeConfig | null }) {
    return unwrap(client.api["qr-codes"]({ id }).put(body));
  }

  delete(id: string) {
    return unwrap(client.api["qr-codes"]({ id }).delete());
  }
}
