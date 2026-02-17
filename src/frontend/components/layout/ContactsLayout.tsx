import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/data/api";
import { queryKeys } from "@/queries/keys";
import { cn } from "@/lib/utils";
import { Users, Mail, Plus } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  );

export function ContactsLayout() {
  const { data: lists = [] } = useQuery({
    queryKey: queryKeys.mailingLists,
    queryFn: () => api.mailingLists.list(),
  });

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <aside className="w-56 shrink-0 border-r pr-4">
        <nav className="space-y-6 py-4" aria-label="Contacts section">
          <div>
            <NavLink to="/contacts" end className={navLinkClass}>
              <Users className="size-4" />
              All contacts
            </NavLink>
          </div>

          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mailing lists
            </h3>
            <ul className="space-y-0.5">
              {lists.map((list) => (
                <li key={list.id}>
                  <NavLink
                    to={`/contacts/lists/${list.id}`}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )
                    }
                  >
                    <Mail className="size-4 shrink-0 opacity-60" />
                    <span className="truncate">{list.name}</span>
                    {list.member_count != null && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {list.member_count}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/contacts/lists"
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )
                  }
                >
                  <Plus className="size-4 shrink-0" />
                  Add new list
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
