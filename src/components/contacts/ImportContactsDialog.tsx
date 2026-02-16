import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parseVCardFile, parsedToContactPayload, type ParsedVCardContact } from "@/lib/vcard";
import { api } from "@/data/api";
import type { Contact } from "@/types/contact";
import { Upload, FileText } from "lucide-react";

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ImportMode = "vcard" | "csv" | null;

export function ImportContactsDialog({ open, onOpenChange, onSuccess }: ImportContactsDialogProps) {
  const [mode, setMode] = useState<ImportMode>(null);
  const [parsed, setParsed] = useState<ParsedVCardContact[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "vcf" || ext === "vcard") {
        setMode("vcard");
        try {
          const text = await file.text();
          const contacts = parseVCardFile(text);
          setParsed(contacts);
          if (contacts.length === 0) setError("No valid contacts found in file.");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to parse vCard");
          setParsed([]);
        }
      } else if (ext === "csv") {
        setMode("csv");
        setError("CSV import: parse file and map columns. For now, use vCard (.vcf) for import.");
        setParsed([]);
      } else {
        setError("Please select a .vcf or .csv file.");
      }
      e.target.value = "";
    },
    []
  );

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setImporting(true);
    try {
      let created = 0;
      for (const p of parsed) {
        const payload = parsedToContactPayload(p);
        await api.contacts.create(payload as Parameters<typeof api.contacts.create>[0]);
        created++;
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setMode(null);
    setParsed([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Import from vCard (.vcf) or CSV. vCard is the primary format and supports multiple contacts per file.
        </p>

        <div className="space-y-4">
          <div>
            <Label>Select file</Label>
            <div className="mt-2 flex gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted">
                <Upload className="size-4" />
                <span>Choose vCard (.vcf)</span>
                <input type="file" accept=".vcf,.vcard" onChange={handleFile} className="hidden" />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted">
                <FileText className="size-4" />
                <span>Choose CSV</span>
                <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {parsed.length > 0 && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                {parsed.length} contact{parsed.length !== 1 ? "s" : ""} ready to import
              </p>
              <ul className="mt-2 max-h-40 overflow-y-auto text-sm text-muted-foreground">
                {parsed.slice(0, 10).map((p, i) => (
                  <li key={i}>{p.fn || p.org || "Unknown"}</li>
                ))}
                {parsed.length > 10 && <li>... and {parsed.length - 10} more</li>}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={parsed.length === 0 || importing}>
            {importing ? "Importing..." : `Import ${parsed.length} contact${parsed.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
