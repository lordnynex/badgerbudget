import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const isBudgetingActive = location.pathname.startsWith("/budgeting");

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex h-10 items-center justify-center border-b-2 px-4 text-sm font-medium transition-colors",
      isActive
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-6">
        <NavLink to="/" className="text-xl font-bold hover:opacity-90">
          Satyrs M/C
        </NavLink>
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink
            to="/budgeting/projections"
            className={({ isActive }) => navLinkClass({ isActive: isActive || isBudgetingActive })}
          >
            Budgeting
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>
          <NavLink to="/contacts" className={navLinkClass}>
            Contacts
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <NavLink to="/members" className={navLinkClass}>
          Members
        </NavLink>
      </div>
    </header>
  );
}
