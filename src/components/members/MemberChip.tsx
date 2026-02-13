import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

interface MemberChipProps {
  memberId: string;
  name: string;
  photo: string | null;
}

export function MemberChip({ memberId, name, photo }: MemberChipProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/members/${memberId}`)}
      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2 py-0.5 text-sm transition-colors hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <span className="size-5 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {photo ? (
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <User className="size-3 text-muted-foreground" />
        )}
      </span>
      <span className="truncate max-w-[120px]">{name}</span>
    </button>
  );
}
