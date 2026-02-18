import type { Document, DocumentVersion } from "@/shared/types/document";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json();
}

export class DocumentsApiClient {
  get(id: string) {
    return fetchJson<Document | null>(`/api/documents/${id}`);
  }

  update(id: string, body: { content: string }) {
    return fetchJson<Document>(`/api/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  listVersions(id: string) {
    return fetchJson<DocumentVersion[]>(`/api/documents/${id}/versions`);
  }

  getVersion(id: string, versionId: string) {
    return fetchJson<DocumentVersion | null>(`/api/documents/${id}/versions/${versionId}`);
  }

  restore(id: string, body: { version_id?: string; version_number?: number }) {
    return fetchJson<Document>(`/api/documents/${id}/restore`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** Export document as PDF (formatted text only, no styling). Returns blob for download. */
  async exportPdf(documentId: string, filename: string): Promise<void> {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/documents/${documentId}/pdf`);
    if (!res.ok) throw new Error("Failed to export PDF");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
