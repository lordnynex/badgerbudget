import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/data/api";
import type { Member } from "@/types/budget";
import { MEMBER_POSITIONS } from "@/types/budget";
import { ChevronDown, ChevronRight, Download, FileJson, Plus, User } from "lucide-react";

function downloadMembersJson(members: Member[]) {
  const json = JSON.stringify(members, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members.json";
  a.click();
  URL.revokeObjectURL(url);
}

function escapeVCardValue(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function memberToVCard(m: Member): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  lines.push(`FN:${escapeVCardValue(m.name)}`);
  const nameParts = m.name.trim().split(/\s+/);
  const family = nameParts.length > 1 ? nameParts.pop()! : "";
  const given = nameParts.join(" ");
  lines.push(`N:${escapeVCardValue(family)};${escapeVCardValue(given)};;;`);
  if (m.phone_number) lines.push(`TEL;TYPE=CELL:${m.phone_number.replace(/\s/g, "")}`);
  if (m.email) lines.push(`EMAIL:${m.email}`);
  if (m.address) lines.push(`ADR;TYPE=HOME:;;${escapeVCardValue(m.address)};;;;`);
  if (m.birthday) lines.push(`BDAY:${m.birthday.replace(/-/g, "")}`);
  if (m.position) lines.push(`TITLE:${escapeVCardValue(m.position)}`);
  if (m.emergency_contact_name || m.emergency_contact_phone) {
    const note = [m.emergency_contact_name, m.emergency_contact_phone].filter(Boolean).join(": ");
    lines.push(`NOTE:Emergency contact: ${escapeVCardValue(note)}`);
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function downloadMembersVCard(members: Member[]) {
  const vcf = members.map(memberToVCard).join("\r\n");
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members.vcf";
  a.click();
  URL.revokeObjectURL(url);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function MemberCard({
  m,
  onNavigate,
}: {
  m: Member;
  onNavigate: (id: string) => void;
}) {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.99]"
      onClick={() => onNavigate(m.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="size-14 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {m.photo ? (
              <img src={m.photo} alt="" className="size-full object-cover" />
            ) : (
              <User className="size-7 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{m.name}</CardTitle>
            {m.position && (
              <p className="text-sm text-muted-foreground truncate">
                {m.position}
              </p>
            )}
            {!m.position && m.phone_number && (
              <p className="text-sm text-muted-foreground truncate">
                {m.phone_number}
              </p>
            )}
            {m.position && m.phone_number && (
              <p className="text-xs text-muted-foreground truncate">
                {m.phone_number}
              </p>
            )}
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </div>
      </CardHeader>
    </Card>
  );
}

export function MembersPanel() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [addBirthday, setAddBirthday] = useState("");
  const [addPosition, setAddPosition] = useState<string>("");
  const [addEmergencyName, setAddEmergencyName] = useState("");
  const [addEmergencyPhone, setAddEmergencyPhone] = useState("");
  const [addPhoto, setAddPhoto] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await api.members.list();
      setMembers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const resetAddForm = () => {
    setAddName("");
    setAddPhone("");
    setAddEmail("");
    setAddAddress("");
    setAddBirthday("");
    setAddPosition("");
    setAddEmergencyName("");
    setAddEmergencyPhone("");
    setAddPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddMember = async () => {
    if (!addName.trim()) return;
    setAddSaving(true);
    try {
      await api.members.create({
        name: addName.trim(),
        phone_number: addPhone.trim() || undefined,
        email: addEmail.trim() || undefined,
        address: addAddress.trim() || undefined,
        birthday: addBirthday || undefined,
        position: addPosition || undefined,
        emergency_contact_name: addEmergencyName.trim() || undefined,
        emergency_contact_phone: addEmergencyPhone.trim() || undefined,
        photo: addPhoto || undefined,
      });
      setAddOpen(false);
      resetAddForm();
      await refresh();
    } finally {
      setAddSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setAddPhoto(base64);
    } catch {
      // ignore
    }
  };

  const officers = members.filter(
    (m) => m.position && m.position !== "Member"
  );
  const regularMembers = members.filter(
    (m) => !m.position || m.position === "Member"
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading members...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">
            Club member profiles. Click a member to view and edit their details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Export
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadMembersJson(members)}>
                <FileJson className="size-4" />
                Download JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadMembersVCard(members)}>
                <Download className="size-4" />
                Download vCard (.vcf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add Member
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Officers</h2>
        <p className="text-sm text-muted-foreground">
          Members with club positions (President, Vice President, Treasurer, etc.)
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officers.map((m) => (
            <MemberCard key={m.id} m={m} onNavigate={(id) => navigate(`/members/${id}`)} />
          ))}
        </div>
        {officers.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No officers yet.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="text-sm text-muted-foreground">
          General members (position: Member or None)
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regularMembers.map((m) => (
            <MemberCard key={m.id} m={m} onNavigate={(id) => navigate(`/members/${id}`)} />
          ))}
        </div>
        {regularMembers.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No members yet.
          </p>
        )}
      </section>

      <Dialog open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) resetAddForm();
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <CardDescription>Create a new club member profile</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={addAddress}
                onChange={(e) => setAddAddress(e.target.value)}
                placeholder="Street, city, state, zip"
              />
            </div>
            <div className="space-y-2">
              <Label>Birthday</Label>
              <Input
                type="date"
                value={addBirthday}
                onChange={(e) => setAddBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={addPosition || "none"} onValueChange={(v) => setAddPosition(v === "none" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {MEMBER_POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input
                value={addEmergencyName}
                onChange={(e) => setAddEmergencyName(e.target.value)}
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Phone</Label>
              <Input
                value={addEmergencyPhone}
                onChange={(e) => setAddEmergencyPhone(e.target.value)}
                placeholder="(555) 987-6543"
              />
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium hover:file:bg-primary/90"
              />
              {addPhoto && (
                <div className="mt-2">
                  <img
                    src={addPhoto}
                    alt="Preview"
                    className="size-20 rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!addName.trim() || addSaving}>
              {addSaving ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
