import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/data/api";
import type { Contact, ContactSearchParams, Tag } from "@/types/contact";
import { contactsToVCardFile } from "@/lib/vcard";
import { Link } from "react-router-dom";
import { Plus, Search, ChevronDown, Download, Upload, List } from "lucide-react";
import { AddContactDialog } from "./AddContactDialog";
import { ImportContactsDialog } from "./ImportContactsDialog";
import { AddToMailingListDialog } from "./AddToMailingListDialog";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export function ContactsPanel() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactSearchParams["status"]>("active");
  const [hasPostal, setHasPostal] = useState<boolean | undefined>();
  const [hasEmail, setHasEmail] = useState<boolean | undefined>();
  const [sort, setSort] = useState<ContactSearchParams["sort"]>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Tag[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addToListOpen, setAddToListOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.contacts.list({
        q: debouncedSearch || undefined,
        status,
        hasPostalAddress: hasPostal,
        hasEmail,
        sort,
        sortDir,
        page,
        limit: 25,
      });
      setContacts(result.contacts);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, hasPostal, hasEmail, sort, sortDir, page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    api.contacts.tags.list().then(setTags);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)));
    }
  };

  const handleBulkExportVCard = () => {
    const toExport = selectedIds.size ? contacts.filter((c) => selectedIds.has(c.id)) : contacts;
    if (toExport.length === 0) return;
    const vcf = contactsToVCardFile(toExport);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.vcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkMarkInactive = async () => {
    if (selectedIds.size === 0) return;
    await api.contacts.bulkUpdate([...selectedIds], { status: "inactive" });
    setSelectedIds(new Set());
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Unified directory for people and organizations. Manage mailing lists for events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            Import
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contacts/lists">Mailing Lists</Link>
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone, city, tags, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status ?? "active"} onValueChange={(v) => setStatus(v as ContactSearchParams["status"])}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hasPostal === undefined ? "any" : hasPostal ? "yes" : "no"} onValueChange={(v) => setHasPostal(v === "any" ? undefined : v === "yes")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Address" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any address</SelectItem>
                <SelectItem value="yes">Has postal</SelectItem>
                <SelectItem value="no">No postal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hasEmail === undefined ? "any" : hasEmail ? "yes" : "no"} onValueChange={(v) => setHasEmail(v === "any" ? undefined : v === "yes")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any email</SelectItem>
                <SelectItem value="yes">Has email</SelectItem>
                <SelectItem value="no">No email</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sort}-${sortDir}`} onValueChange={(v) => { const [s, d] = v.split("-"); setSort(s as ContactSearchParams["sort"]); setSortDir((d as "asc" | "desc") ?? "desc"); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="updated_at-desc">Last updated</SelectItem>
                <SelectItem value="updated_at-asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedIds.size > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" onClick={handleBulkExportVCard}>
                <Download className="size-4" />
                Export vCard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAddToListOpen(true)}>
                <List className="size-4" />
                Add to list
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkMarkInactive}>
                Mark inactive
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No contacts found. Add one or import from vCard/CSV.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="w-10 px-2 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === contacts.length && contacts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-2 py-2 text-left font-medium">Name</th>
                    <th className="px-2 py-2 text-left font-medium">Organization</th>
                    <th className="px-2 py-2 text-left font-medium">Email</th>
                    <th className="px-2 py-2 text-left font-medium">Tags</th>
                    <th className="px-2 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/contacts/${c.id}`)}
                    >
                      <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-2 py-2 font-medium">{c.display_name}</td>
                      <td className="px-2 py-2 text-muted-foreground">{c.organization_name ?? "—"}</td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {c.emails?.[0]?.email ?? "—"}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags ?? []).slice(0, 3).map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs"
                            >
                              {t.name}
                            </span>
                          ))}
                          {(c.tags ?? []).length > 3 && (
                            <span className="text-muted-foreground text-xs">+{(c.tags ?? []).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs ${
                            c.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 25 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={refresh} />
      <ImportContactsDialog open={importOpen} onOpenChange={setImportOpen} onSuccess={refresh} />
      <AddToMailingListDialog
        open={addToListOpen}
        onOpenChange={setAddToListOpen}
        contactIds={[...selectedIds]}
        onSuccess={() => {
          setSelectedIds(new Set());
          refresh();
        }}
      />
    </div>
  );
}
