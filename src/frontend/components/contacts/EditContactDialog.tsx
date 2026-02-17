import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/data/api";
import type { Contact } from "@/types/contact";

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSuccess: () => void;
}

export function EditContactDialog({ open, onOpenChange, contact, onSuccess }: EditContactDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [howWeKnow, setHowWeKnow] = useState("");
  const [clubName, setClubName] = useState("");
  const [role, setRole] = useState("");
  const [okToEmail, setOkToEmail] = useState<Contact["ok_to_email"]>("unknown");
  const [okToMail, setOkToMail] = useState<Contact["ok_to_mail"]>("unknown");
  const [doNotContact, setDoNotContact] = useState(false);
  const [emails, setEmails] = useState<Array<{ email: string; type: string; is_primary: boolean }>>([]);
  const [phones, setPhones] = useState<Array<{ phone: string; type: string; is_primary: boolean }>>([]);
  const [addresses, setAddresses] = useState<
    Array<{
      address_line1: string;
      address_line2: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      type: string;
      is_primary_mailing: boolean;
    }>
  >([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact && open) {
      setDisplayName(contact.display_name ?? "");
      setFirstName(contact.first_name ?? "");
      setLastName(contact.last_name ?? "");
      setOrgName(contact.organization_name ?? "");
      setHowWeKnow(contact.how_we_know_them ?? "");
      setClubName(contact.club_name ?? "");
      setRole(contact.role ?? "");
      setOkToEmail(contact.ok_to_email);
      setOkToMail(contact.ok_to_mail);
      setDoNotContact(contact.do_not_contact);
      setEmails(
        (contact.emails ?? []).map((e) => ({
          email: e.email,
          type: e.type,
          is_primary: e.is_primary,
        }))
      );
      setPhones(
        (contact.phones ?? []).map((p) => ({
          phone: p.phone,
          type: p.type,
          is_primary: p.is_primary,
        }))
      );
      setAddresses(
        (contact.addresses ?? []).length > 0
          ? contact.addresses!.map((a) => ({
              address_line1: a.address_line1 ?? "",
              address_line2: a.address_line2 ?? "",
              city: a.city ?? "",
              state: a.state ?? "",
              postal_code: a.postal_code ?? "",
              country: a.country ?? "US",
              type: a.type,
              is_primary_mailing: a.is_primary_mailing,
            }))
          : [{ address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "US", type: "home", is_primary_mailing: true }]
      );
      setTagNames((contact.tags ?? []).map((t) => t.name));
    }
  }, [contact, open]);

  const handleSubmit = async () => {
    if (!contact) return;
    const name = displayName.trim() || [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
    setSaving(true);
    try {
      await api.contacts.update(contact.id, {
        display_name: name,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        organization_name: orgName.trim() || null,
        how_we_know_them: howWeKnow.trim() || null,
        club_name: clubName.trim() || null,
        role: role.trim() || null,
        ok_to_email: okToEmail,
        ok_to_mail: okToMail,
        do_not_contact: doNotContact,
        emails: emails.filter((e) => e.email.trim()).map((e) => ({
          id: "",
          contact_id: contact.id,
          email: e.email.trim(),
          type: (e.type as Contact["emails"] extends (infer E)[] ? E extends { type: infer T } ? T : never : never) ?? "other",
          is_primary: e.is_primary,
        })),
        phones: phones.filter((p) => p.phone.trim()).map((p) => ({
          id: "",
          contact_id: contact.id,
          phone: p.phone.trim(),
          type: (p.type as "work" | "home" | "cell" | "other") ?? "other",
          is_primary: p.is_primary,
        })),
        addresses: addresses
          .filter((a) => a.address_line1.trim() || a.city.trim() || a.postal_code.trim())
          .map((a) => ({
            id: "",
            contact_id: contact.id,
            address_line1: a.address_line1.trim() || null,
            address_line2: a.address_line2.trim() || null,
            city: a.city.trim() || null,
            state: a.state.trim() || null,
            postal_code: a.postal_code.trim() || null,
            country: a.country || "US",
            type: (a.type as "home" | "work" | "postal" | "other") ?? "home",
            is_primary_mailing: a.is_primary_mailing,
          })),
        tags: tagNames.filter(Boolean).map((name) => ({ id: "", name })),
      });
      onOpenChange(false);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Display name *</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Organization</Label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div>
            <Label>Primary email</Label>
            <Input
              type="email"
              value={emails[0]?.email ?? ""}
              onChange={(e) =>
                setEmails((prev) => {
                  const next = [...prev];
                  if (!next[0]) next[0] = { email: "", type: "other", is_primary: true };
                  next[0].email = e.target.value;
                  return next;
                })
              }
            />
          </div>
          <div>
            <Label>Primary phone</Label>
            <Input
              value={phones[0]?.phone ?? ""}
              onChange={(e) =>
                setPhones((prev) => {
                  const next = [...prev];
                  if (!next[0]) next[0] = { phone: "", type: "other", is_primary: true };
                  next[0].phone = e.target.value;
                  return next;
                })
              }
            />
          </div>
          {addresses[0] && (
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={addresses[0].address_line1}
                onChange={(e) =>
                  setAddresses((prev) => {
                    const next = [...prev];
                    next[0] = { ...next[0]!, address_line1: e.target.value };
                    return next;
                  }
                )}
                placeholder="Street"
              />
              <Input
                value={addresses[0].address_line2}
                onChange={(e) =>
                  setAddresses((prev) => {
                    const next = [...prev];
                    next[0] = { ...next[0]!, address_line2: e.target.value };
                    return next;
                  }
                )}
                placeholder="Apt, suite"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={addresses[0].city}
                  onChange={(e) =>
                    setAddresses((prev) => {
                      const next = [...prev];
                      next[0] = { ...next[0]!, city: e.target.value };
                      return next;
                    })
                  }
                  placeholder="City"
                />
                <Input
                  value={addresses[0].state}
                  onChange={(e) =>
                    setAddresses((prev) => {
                      const next = [...prev];
                      next[0] = { ...next[0]!, state: e.target.value };
                      return next;
                    })
                  }
                  placeholder="State"
                />
                <Input
                  value={addresses[0].postal_code}
                  onChange={(e) =>
                    setAddresses((prev) => {
                      const next = [...prev];
                      next[0] = { ...next[0]!, postal_code: e.target.value };
                      return next;
                    })
                  }
                  placeholder="ZIP"
                />
              </div>
            </div>
          )}
          <div>
            <Label>Club / affiliation</Label>
            <Input value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>
          <div>
            <Label>Role / title</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>OK to email</Label>
              <Select value={okToEmail} onValueChange={(v) => setOkToEmail(v as Contact["ok_to_email"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>OK to mail</Label>
              <Select value={okToMail} onValueChange={(v) => setOkToMail(v as Contact["ok_to_mail"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="doNotContact"
              checked={doNotContact}
              onChange={(e) => setDoNotContact(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="doNotContact">Do not contact</Label>
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              value={tagNames.join(", ")}
              onChange={(e) => setTagNames(e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as string[])}
              placeholder="Vendor, Club, VIP"
            />
          </div>
          <div>
            <Label>How we know them</Label>
            <Input value={howWeKnow} onChange={(e) => setHowWeKnow(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
