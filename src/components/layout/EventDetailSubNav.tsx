import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "event-details", label: "Details" },
  { id: "location", label: "Location" },
  { id: "milestones", label: "Milestones" },
  { id: "packing", label: "Packing" },
  { id: "volunteers", label: "Volunteers" },
  { id: "notes", label: "Notes" },
] as const;

interface EventDetailSubNavProps {
  className?: string;
}

export function EventDetailSubNav({ className }: EventDetailSubNavProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <nav
        className="flex flex-wrap items-center gap-1"
        aria-label="Event detail page sections"
      >
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
