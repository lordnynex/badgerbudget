import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/data/api";
import type { Member } from "@/types/budget";
import { MemberCard } from "./MemberCard";
import { MembersExportDropdown } from "./MembersExportDropdown";
import { UpcomingBirthdaysSection } from "./UpcomingBirthdaysSection";
import { UpcomingAnniversariesSection } from "./UpcomingAnniversariesSection";
import { AddMemberDialog } from "./AddMemberDialog";
import { Plus } from "lucide-react";

export function MembersPanel() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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

  const officers = members.filter((m) => m.position && m.position !== "Member");
  const regularMembers = members.filter((m) => !m.position || m.position === "Member");

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
          <MembersExportDropdown members={members} />
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add Member
          </Button>
        </div>
      </div>

      <UpcomingBirthdaysSection members={members} />
      <UpcomingAnniversariesSection members={members} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Officers</h2>
        <p className="text-sm text-muted-foreground">
          Members with club positions (President, Vice President, Treasurer, etc.)
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officers.map((m) => (
            <MemberCard key={m.id} member={m} onNavigate={(id) => navigate(`/members/${id}`)} />
          ))}
        </div>
        {officers.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No officers yet.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="text-sm text-muted-foreground">
          General members (position: Member or None)
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regularMembers.map((m) => (
            <MemberCard key={m.id} member={m} onNavigate={(id) => navigate(`/members/${id}`)} />
          ))}
        </div>
        {regularMembers.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No members yet.</p>
        )}
      </section>

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={refresh} />
    </div>
  );
}
