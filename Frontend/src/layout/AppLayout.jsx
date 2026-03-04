import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { Button } from "@/components/shadcn/button";
import { LayoutGrid, RotateCcw, Clock, Users, Zap, LogOut } from "lucide-react";

const linkBase = "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2";
const linkActive = "border-zinc-900 text-zinc-900";
const linkIdle = "border-transparent text-zinc-500 hover:text-zinc-700";

export default function AppLayout() {
  const navigate = useNavigate();

  // Ruimt auth-state op en forceert terug naar login.
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="w-full min-h-screen">
      {/* Top bar */}
      <header className="p-4 border-b border-zinc-300 bg-white">
        <div className="mx-auto max-w-full px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold text-zinc-900">
            Smart Home
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded border border-zinc-300">
              <span className="text-sm font-medium text-zinc-900">Admin User</span>
              <span className="ml-2 rounded-full bg-zinc-900 text-white px-2 py-0.5 text-xs font-bold">ADMIN</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 border-zinc-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-zinc-300 bg-white">
        <div className="mx-auto max-w-full px-6 flex gap-1">
          {/* Alle hoofdmodules van de app gebruiken dezelfde tabstijl. */}
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/routines" 
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <RotateCcw className="w-4 h-4" />
            Routines
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <Clock className="w-4 h-4" />
            History
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <Users className="w-4 h-4" />
            Users
          </NavLink>
          <NavLink 
            to="/devices" 
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            <Zap className="w-4 h-4" />
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
