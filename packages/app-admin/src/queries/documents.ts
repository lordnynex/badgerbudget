import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/data/api";

export function useUpdateDocument() {
  const api = useApi();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { content: string } }) =>
      api.documents.update(id, body),
    onSuccess: () => {},
  });
}

export function useExportDocumentPdf() {
  const api = useApi();
  return useMutation({
    mutationFn: ({ documentId, filename }: { documentId: string; filename: string }) =>
      api.documents.exportPdf(documentId, filename),
  });
}
