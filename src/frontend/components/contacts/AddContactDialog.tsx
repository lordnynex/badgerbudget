import { useState } from "react";
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

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddContactDialog({ open, onOpenChange, onSuccess }: AddContactDialogProps) {
  const [type, setType] = useState<Contact["type"]>("person");
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [clubName, setClubName] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setType("person");
    setDisplayName("");
    setFirstName("");
    setLastName("");
    setOrgName("");
    setPrimaryEmail("");
    setPrimaryPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setNotes("");
    setClubName("");
    setRole("");
  };

  const handleSubmit = async () => {
    const name = displayName.trim() || (type === "person" ? [firstName, lastName].filter(Boolean).join(" ") : orgName) || "Unknown";
    if (!name) return;
    setSaving(true);
    try {
      await api.contacts.create({
        type,
        display_name: name,
        first_name: type === "person" ? firstName.trim() || null : null,
        last_name: type === "person" ? lastName.trim() || null : null,
        organization_name: type === "organization" ? orgName.trim() || null : (orgName.trim() || null),
        notes: notes.trim() || null,
        club_name: clubName.trim() || null,
        role: role.trim() || null,
        emails: primaryEmail.trim() ? [{ id: "", contact_id: "", email: primaryEmail.trim(), type: "other" as const, is_primary: true }] : [],
        phones: primaryPhone.trim() ? [{ id: "", contact_id: "", phone: primaryPhone.trim(), type: "other" as const, is_primary: true }] : [],
        addresses:
          addressLine1.trim() || city.trim() || postalCode.trim()
            ? [
                {
                  id: "",
                  contact_id: "",
                  address_line1: addressLine1.trim() || null,
                  address_line2: addressLine2.trim() || null,
                  city: city.trim() || null,
                  state: state.trim() || null,
                  postal_code: postalCode.trim() || null,
                  country: "US",
                  type: "home" as const,
                  is_primary_mailing: true,
                },
              ]
            : [],
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as Contact["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "person" ? (
            <>
              <div>
                <Label>Display name *</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full name" />
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
            </>
          ) : (
            <div>
              <Label>Organization name *</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Company or org name" />
            </div>
          )}

          {type === "person" && (
            <div>
              <Label>Organization (optional)</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Affiliation" />
            </div>
          )}

          <div>
            <Label>Primary email</Label>
            <Input type="email" value={primaryEmail} onChange={(e) => setPrimaryEmail(e.target.value)} />
          </div>
          <div>
            <Label>Primary phone</Label>
            <Input value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address" />
            <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt, suite, etc." />
            <div className="grid grid-cols-3 gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="ZIP" />
            </div>
          </div>

          <div>
            <Label>Club / affiliation</Label>
            <Input value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>
          <div>
            <Label>Role / title</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Add Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
