import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-6">
        <NavLink to="/" className="text-xl font-bold hover:opacity-90">
          Satyrs M/C
        </NavLink>
        <nav className="flex items-center gap-1 rounded-lg bg-muted p-1" aria-label="Main navigation">
          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>
          <NavLink to="/projections" className={navLinkClass}>
            Projections
          </NavLink>
          <NavLink to="/budget" className={navLinkClass}>
            Budgets
          </NavLink>
          <NavLink to="/scenarios" className={navLinkClass}>
            Scenarios
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <NavLink to="/contacts" className={navLinkClass}>
          Contacts
        </NavLink>
        <NavLink to="/members" className={navLinkClass}>
          Members
        </NavLink>
      </div>
    </header>
  );
}
