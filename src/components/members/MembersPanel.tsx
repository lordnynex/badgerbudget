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
import { Baby, Calendar, CalendarCheck, ChevronDown, ChevronRight, Download, FileJson, Plus, User } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  const noteParts: string[] = [];
  if (m.member_since) {
    const [y, mo] = m.member_since.split("-");
    noteParts.push(`Member since ${mo}/${y}`);
  }
  if (m.emergency_contact_name || m.emergency_contact_phone) {
    const ec = [m.emergency_contact_name, m.emergency_contact_phone].filter(Boolean).join(": ");
    noteParts.push(`Emergency contact: ${ec}`);
  }
  if (noteParts.length > 0) {
    lines.push(`NOTE:${escapeVCardValue(noteParts.join(". "))}`);
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

function escapeIcalText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function downloadBirthdaysIcal(members: Member[]) {
  const withBirthday = members.filter((m) => m.birthday && /^\d{4}-\d{2}-\d{2}$/.test(m.birthday));
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Badger Budget//Members Birthdays//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const m of withBirthday) {
    const dt = (m.birthday ?? "").replace(/-/g, "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:member-${m.id}-birthday@badgerbudget`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push("RRULE:FREQ=YEARLY");
    lines.push(`SUMMARY:${escapeIcalText(m.name)}'s Birthday`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  const ics = lines.join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "member-birthdays.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function getUpcomingBirthdays(members: Member[], daysAhead = 90): { member: Member; date: Date }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const result: { member: Member; date: Date }[] = [];
  for (const m of members) {
    if (!m.birthday || !/^\d{4}-\d{2}-\d{2}$/.test(m.birthday)) continue;
    const [, month, day] = m.birthday.split("-").map(Number);
    const thisYear = new Date(today.getFullYear(), month - 1, day);
    const nextYear = new Date(today.getFullYear() + 1, month - 1, day);
    const bdayDate = thisYear >= today ? thisYear : nextYear;
    if (bdayDate >= today && bdayDate <= endDate) {
      result.push({ member: m, date: bdayDate });
    }
  }
  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

function formatBirthdayDate(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getYearsAsMember(memberSince: string | null): number | null {
  if (!memberSince || !/^\d{4}-\d{2}$/.test(memberSince)) return null;
  const start = new Date(memberSince + "-01");
  const today = new Date();
  const years = (today.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years);
}

function formatMemberSinceDisplay(memberSince: string | null): string {
  if (!memberSince || !/^\d{4}-\d{2}$/.test(memberSince)) return "";
  const [y, mo] = memberSince.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(mo, 10) - 1] ?? mo;
  const years = getYearsAsMember(memberSince);
  if (years !== null) {
    return `${month} ${y} (${years} year${years === 1 ? "" : "s"})`;
  }
  return `${month} ${y}`;
}

function getUpcomingAnniversaries(members: Member[], daysAhead = 90): { member: Member; date: Date }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const result: { member: Member; date: Date }[] = [];
  for (const m of members) {
    if (!m.member_since || !/^\d{4}-\d{2}$/.test(m.member_since)) continue;
    const [, month] = m.member_since.split("-").map(Number);
    const thisYear = new Date(today.getFullYear(), month - 1, 1);
    const nextYear = new Date(today.getFullYear() + 1, month - 1, 1);
    const annivDate = thisYear >= today ? thisYear : nextYear;
    if (annivDate >= today && annivDate <= endDate) {
      result.push({ member: m, date: annivDate });
    }
  }
  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

function formatAnniversaryDate(date: Date, member: Member): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const base = `${months[date.getMonth()]} ${date.getDate()}`;
  if (!member.member_since || !/^\d{4}-\d{2}$/.test(member.member_since)) return base;
  const joinYear = parseInt(member.member_since.slice(0, 4), 10);
  const years = date.getFullYear() - joinYear;
  return `${base} (${years} year${years === 1 ? "" : "s"})`;
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
            <CardTitle className="text-lg truncate flex items-center gap-1.5">
              {m.name}
              {m.is_baby && <Baby className="size-4 text-muted-foreground shrink-0" title="Baby" />}
            </CardTitle>
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
            {m.member_since && (
              <p className="text-xs text-muted-foreground truncate">
                {formatMemberSinceDisplay(m.member_since)}
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
  const [addMemberSinceMonth, setAddMemberSinceMonth] = useState<string>("");
  const [addMemberSinceYear, setAddMemberSinceYear] = useState<string>("");
  const [addIsBaby, setAddIsBaby] = useState(false);
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
    setAddMemberSinceMonth("");
    setAddMemberSinceYear("");
    setAddIsBaby(false);
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
      const memberSince =
        addMemberSinceMonth && addMemberSinceYear
          ? `${addMemberSinceYear}-${addMemberSinceMonth.padStart(2, "0")}`
          : undefined;
      await api.members.create({
        name: addName.trim(),
        phone_number: addPhone.trim() || undefined,
        email: addEmail.trim() || undefined,
        address: addAddress.trim() || undefined,
        birthday: addBirthday || undefined,
        member_since: memberSince,
        is_baby: addIsBaby,
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
            {members.length > 0 && (
              <> {members.length} member{members.length === 1 ? "" : "s"} total.</>
            )}
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
              <DropdownMenuItem onClick={() => downloadBirthdaysIcal(members)}>
                <Calendar className="size-4" />
                Birthdays (.ics)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add Member
          </Button>
        </div>
      </div>

      {(() => {
        const upcoming = getUpcomingBirthdays(members);
        if (upcoming.length === 0) return null;
        return (
          <section className="rounded-lg border bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Upcoming birthdays (next 3 months)</h2>
            <ul className="space-y-1 text-sm">
              {upcoming.map(({ member, date }) => (
                <li key={member.id} className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                  <button
                    type="button"
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="text-primary hover:underline font-medium"
                  >
                    {member.name}
                  </button>
                  <span className="text-muted-foreground">— {formatBirthdayDate(date)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {(() => {
        const upcoming = getUpcomingAnniversaries(members);
        if (upcoming.length === 0) return null;
        return (
          <section className="rounded-lg border bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Upcoming member anniversaries (next 3 months)</h2>
            <ul className="space-y-1 text-sm">
              {upcoming.map(({ member, date }) => (
                <li key={member.id} className="flex items-center gap-2">
                  <CalendarCheck className="size-3.5 text-muted-foreground shrink-0" />
                  <button
                    type="button"
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="text-primary hover:underline font-medium"
                  >
                    {member.name}
                  </button>
                  <span className="text-muted-foreground">— {formatAnniversaryDate(date, member)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

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
              <Label>Member Since</Label>
              <div className="flex gap-2">
                <Select
                  value={addMemberSinceMonth || "none"}
                  onValueChange={(v) => setAddMemberSinceMonth(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Month</SelectItem>
                    {MONTHS.map((mo, i) => (
                      <SelectItem key={mo} value={String(i + 1)}>
                        {mo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={addMemberSinceYear || "none"}
                  onValueChange={(v) => setAddMemberSinceYear(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Year</SelectItem>
                    {Array.from({ length: new Date().getFullYear() - 1985 + 1 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add-is-baby"
                checked={addIsBaby}
                onChange={(e) => setAddIsBaby(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="add-is-baby" className="cursor-pointer font-normal">
                Baby
              </Label>
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
