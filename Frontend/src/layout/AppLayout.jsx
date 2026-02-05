import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { Button } from "@/components/shadcn/button";

const linkBase =
  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition";
const linkActive = "bg-zinc-900 text-white";
const linkIdle = "text-zinc-300 hover:bg-zinc-900/60 hover:text-white";

export default function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="w-screen min-h-screen">
      {/* Top bar */}
      <header className="border-b border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold">
              Smart Home
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
              Admin User <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">ADMIN</span>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-3 flex gap-2">
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Dashboard
          </NavLink>
          <NavLink to="/routines" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Routines
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            History
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Users
          </NavLink>
          <NavLink to="/devices" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Devices
          </NavLink>
        </div>
      </nav>

      {/* Page */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
