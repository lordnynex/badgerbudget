import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, ChevronRight, User } from "lucide-react";
import type { Member } from "@/types/budget";
import { formatMemberSinceDisplay } from "./memberUtils";

interface MemberCardProps {
  member: Member;
  onNavigate: (id: string) => void;
}

export function MemberCard({ member, onNavigate }: MemberCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.99]"
      onClick={() => onNavigate(member.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="size-14 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {member.photo_thumbnail_url ? (
              <img src={member.photo_thumbnail_url} alt="" className="size-full object-cover" />
            ) : (
              <User className="size-7 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate flex items-center gap-1.5">
              {member.name}
              {member.is_baby && (
              <span title="Baby" className="shrink-0">
                <Baby className="size-4 text-muted-foreground" />
              </span>
            )}
            </CardTitle>
            {member.position && (
              <p className="text-sm text-muted-foreground truncate">
                {member.position}
              </p>
            )}
            {!member.position && member.phone_number && (
              <p className="text-sm text-muted-foreground truncate">
                {member.phone_number}
              </p>
            )}
            {member.position && member.phone_number && (
              <p className="text-xs text-muted-foreground truncate">
                {member.phone_number}
              </p>
            )}
            {member.member_since && (
              <p className="text-xs text-muted-foreground truncate">
                {formatMemberSinceDisplay(member.member_since)}
              </p>
            )}
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </div>
      </CardHeader>
    </Card>
  );
}
