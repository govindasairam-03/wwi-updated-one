import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { LayoutDashboard, Users, Briefcase, FileText, Settings as SettingsIcon, KeyRound, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/vks/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — WWI Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: DashboardLayout,
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/vks/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/vks/dashboard/applications", label: "Applications", icon: Users },
  { to: "/vks/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { to: "/vks/dashboard/blogs", label: "Blogs", icon: FileText },
  { to: "/vks/dashboard/settings", label: "Settings", icon: SettingsIcon },
  { to: "/vks/dashboard/change-password", label: "Change Password", icon: KeyRound },
];

function DashboardLayout() {
  const { loading, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }




  const onLogout = async () => { await logout(); navigate({ to: "/admin/login" }); };
  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="h-16 flex items-center px-5 border-b border-border font-semibold">WWI · Admin</div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((it) => (
            <Link key={it.to} to={it.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(it.to, it.exact) ? "bg-foreground text-background" : "hover:bg-secondary text-foreground/80"
              }`}>
              <it.icon className="w-4 h-4" /> {it.label}
            </Link>
          ))}
        </nav>
        <button onClick={onLogout} className="m-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden border-b border-border overflow-x-auto">
          <div className="flex gap-1 p-2">
            {NAV.map((it) => (
              <Link key={it.to} to={it.to}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${isActive(it.to, it.exact) ? "bg-foreground text-background" : "bg-secondary"}`}>
                {it.label}
              </Link>
            ))}
            <button onClick={onLogout} className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-secondary">Logout</button>
          </div>
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden"><Outlet /></main>
      </div>
    </div>
  );
}
