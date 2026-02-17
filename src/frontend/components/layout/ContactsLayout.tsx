import { Outlet, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/data/api";
import { queryKeys } from "@/queries/keys";
import { cn } from "@/lib/utils";
import { Users, Mail, Plus, Mailbox, AtSign } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  );


export function ContactsLayout() {
  const navigate = useNavigate();
  const { data: lists = [] } = useQuery({
    queryKey: queryKeys.mailingLists,
    queryFn: () => api.mailingLists.list(),
  });

  const physicalLists = lists.filter((l) => (l.delivery_type ?? "both") === "physical");
  const emailLists = lists.filter((l) => (l.delivery_type ?? "both") === "email");
  const bothLists = lists.filter((l) => (l.delivery_type ?? "both") === "both");

  const listLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-muted font-medium text-foreground"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    );

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
            <div className="mb-2 flex items-center justify-between px-3">
              <NavLink
                to="/contacts/lists"
                end
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
                  "text-muted-foreground"
                )}
              >
                Mailing lists
              </NavLink>
              <button
                type="button"
                onClick={() => navigate("/contacts/lists?create=1")}
                className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Create new mailing list"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {physicalLists.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Physical
                </p>
                <ul className="space-y-0.5">
                  {physicalLists.map((list) => (
                    <li key={list.id}>
                      <NavLink
                        to={`/contacts/lists/${list.id}`}
                        className={listLinkClass}
                      >
                        <Mailbox className="size-4 shrink-0 opacity-60" />
                        <span className="truncate">{list.name}</span>
                        {list.member_count != null && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {list.member_count}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {emailLists.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Email
                </p>
                <ul className="space-y-0.5">
                  {emailLists.map((list) => (
                    <li key={list.id}>
                      <NavLink
                        to={`/contacts/lists/${list.id}`}
                        className={listLinkClass}
                      >
                        <AtSign className="size-4 shrink-0 opacity-60" />
                        <span className="truncate">{list.name}</span>
                        {list.member_count != null && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {list.member_count}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bothLists.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Both
                </p>
                <ul className="space-y-0.5">
                  {bothLists.map((list) => (
                    <li key={list.id}>
                      <NavLink
                        to={`/contacts/lists/${list.id}`}
                        className={listLinkClass}
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
                </ul>
              </div>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/contacts/lists"
                  end
                  className={listLinkClass}
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
