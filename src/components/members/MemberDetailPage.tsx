import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/data/api";
import type { Member } from "@/types/budget";
import { MEMBER_POSITIONS } from "@/types/budget";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Pencil,
  User,
  X,
} from "lucide-react";

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

function formatBirthday(d: string | null): string {
  if (!d) return "";
  try {
    const [y, mo, day] = d.split("-");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const month = months[parseInt(mo ?? "1", 10) - 1] ?? mo;
    return `${month} ${day}, ${y}`;
  } catch {
    return d;
  }
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const m = await api.members.get(id);
      setMember(m ?? null);
      if (m) {
        setEditName(m.name);
        setEditPhone(m.phone_number ?? "");
        setEditEmail(m.email ?? "");
        setEditAddress(m.address ?? "");
        setEditBirthday(m.birthday ?? "");
        setEditPosition(m.position ?? "");
        setEditEmergencyName(m.emergency_contact_name ?? "");
        setEditEmergencyPhone(m.emergency_contact_phone ?? "");
        setEditPhoto(m.photo ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!id) return;
    setEditSaving(true);
    try {
      await api.members.update(id, {
        name: editName.trim(),
        phone_number: editPhone.trim() || null,
        email: editEmail.trim() || null,
        address: editAddress.trim() || null,
        birthday: editBirthday || null,
        position: editPosition || null,
        emergency_contact_name: editEmergencyName.trim() || null,
        emergency_contact_phone: editEmergencyPhone.trim() || null,
        photo: editPhoto,
      });
      setEditOpen(false);
      await refresh();
    } finally {
      setEditSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setEditPhoto(base64);
    } catch {
      // ignore
    }
  };

  const clearPhoto = () => {
    setEditPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading || !member) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground">
          {loading ? "Loading..." : "Member not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/members")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1" />
        <Button onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <div
                className={`size-24 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center ${member.photo ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
                onClick={() => member.photo && setPhotoLightboxOpen(true)}
                role={member.photo ? "button" : undefined}
                aria-label={member.photo ? "View full size photo" : undefined}
              >
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={`${member.name} photo`}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-12 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                {member.position && (
                  <CardDescription>{member.position}</CardDescription>
                )}
                {!member.position && (
                  <CardDescription>Club member profile</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {member.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <a
                  href={`tel:${member.phone_number}`}
                  className="text-primary hover:underline"
                >
                  {member.phone_number}
                </a>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <a
                  href={`mailto:${member.email}`}
                  className="text-primary hover:underline"
                >
                  {member.email}
                </a>
              </div>
            )}
            {member.address && (
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{member.address}</span>
              </div>
            )}
            {member.birthday && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span>{formatBirthday(member.birthday)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {(member.emergency_contact_name || member.emergency_contact_phone) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="size-4" />
                Emergency Contact
              </CardTitle>
              <CardDescription>Contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.emergency_contact_name && (
                <p className="font-medium">{member.emergency_contact_name}</p>
              )}
              {member.emergency_contact_phone && (
                <a
                  href={`tel:${member.emergency_contact_phone}`}
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Phone className="size-4" />
                  {member.emergency_contact_phone}
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {!member.phone_number &&
        !member.email &&
        !member.address &&
        !member.birthday &&
        !member.position &&
        !member.emergency_contact_name &&
        !member.emergency_contact_phone && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No additional details yet. Click Edit Member to add information.
            </CardContent>
          </Card>
        )}

      {/* Photo Lightbox */}
      <Dialog open={photoLightboxOpen} onOpenChange={setPhotoLightboxOpen}>
        <DialogContent
          className="max-w-[min(90vw,800px)] p-0 border-0 bg-black/95 overflow-hidden"
          showCloseButton={false}
        >
          <div className="relative">
            {member.photo && (
              <img
                src={member.photo}
                alt={`${member.name} - full size`}
                className="max-h-[85vh] w-full object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setPhotoLightboxOpen(false)}
              aria-label="Close"
            >
              <X className="size-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <CardDescription>Update member details</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Street, city, state, zip"
              />
            </div>
            <div className="space-y-2">
              <Label>Birthday</Label>
              <Input
                type="date"
                value={editBirthday}
                onChange={(e) => setEditBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={editPosition || "none"} onValueChange={(v) => setEditPosition(v === "none" ? "" : v)}>
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
                value={editEmergencyName}
                onChange={(e) => setEditEmergencyName(e.target.value)}
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Phone</Label>
              <Input
                value={editEmergencyPhone}
                onChange={(e) => setEditEmergencyPhone(e.target.value)}
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
              {editPhoto ? (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={editPhoto}
                    alt="Preview"
                    className="size-20 rounded-lg object-cover border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearPhoto}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || editSaving}>
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
