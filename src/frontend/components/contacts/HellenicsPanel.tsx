import { BookOpen } from "lucide-react";

export function HellenicsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hellenics</h1>
        <p className="mt-1 text-muted-foreground">
          A directory of the club&apos;s Hellenics.
        </p>
      </div>
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8">
        <BookOpen className="size-12 text-muted-foreground/50" />
        <p className="mt-4 text-center text-muted-foreground">
          This section is under construction. The Hellenics directory will be available here soon.
        </p>
      </div>
    </div>
  );
}
