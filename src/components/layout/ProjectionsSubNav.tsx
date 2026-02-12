import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "food-cost", label: "Food Cost" },
  { id: "cost-analysis", label: "Cost Analysis" },
  { id: "scenario-matrix", label: "Scenario Matrix" },
] as const;

interface ProjectionsSubNavProps {
  className?: string;
}

export function ProjectionsSubNav({ className }: ProjectionsSubNavProps) {
  return (
    <nav
      className={cn("flex flex-wrap gap-2 border-b pb-3", className)}
      aria-label="Projections page sections"
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
  );
}
