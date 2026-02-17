import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Wallet, GitBranch, TrendingUp, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetScenarioLayout } from "./BudgetScenarioLayout";
import { ProjectionsSubNav } from "./ProjectionsSubNav";

const navLinkClass = ({ isActive }: { isActive: boolean }, collapsed?: boolean) =>
  cn(
    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
    collapsed ? "justify-center" : "gap-2",
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  );

interface BudgetingLayoutProps {
  onPrint?: () => void;
  onEmail?: () => void;
}

export function BudgetingLayout({ onPrint, onEmail }: BudgetingLayoutProps) {
  const location = useLocation();
  const isProjections = location.pathname === "/budgeting/projections";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 gap-6 p-4 md:p-6">
      <aside
        className={cn(
          "shrink-0 border-r pr-4 transition-[width] duration-200 ease-in-out",
          collapsed ? "w-14" : "w-56"
        )}
      >
        <div
          className={cn(
            "flex items-center py-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budgeting
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
        <nav className="space-y-1" aria-label="Budgeting section">
          <NavLink
            to="/budgeting/budget"
            className={({ isActive }) => navLinkClass({ isActive }, collapsed)}
            title={collapsed ? "Budgets" : undefined}
          >
            <Wallet className="size-4 shrink-0" />
            {!collapsed && <span>Budgets</span>}
          </NavLink>
          <NavLink
            to="/budgeting/scenarios"
            className={({ isActive }) => navLinkClass({ isActive }, collapsed)}
            title={collapsed ? "Scenarios" : undefined}
          >
            <GitBranch className="size-4 shrink-0" />
            {!collapsed && <span>Scenarios</span>}
          </NavLink>
          <NavLink
            to="/budgeting/projections"
            className={({ isActive }) => navLinkClass({ isActive }, collapsed)}
            title={collapsed ? "Projections" : undefined}
          >
            <TrendingUp className="size-4 shrink-0" />
            {!collapsed && <span>Projections</span>}
          </NavLink>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        {isProjections && onPrint && onEmail && (
          <ProjectionsSubNav onPrint={onPrint} onEmail={onEmail} />
        )}
        <BudgetScenarioLayout>
          <Outlet />
        </BudgetScenarioLayout>
      </div>
    </div>
  );
}
