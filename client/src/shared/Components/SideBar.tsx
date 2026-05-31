import { NavLink } from "react-router-dom";
import { Compass, FolderOpen, LockOpen, User, LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/rooms",           icon: Compass,    label: "Discover"        },
  { to: "/rooms/mine",      icon: FolderOpen, label: "My Rooms"        },
  { to: "/rooms/permitted", icon: LockOpen,   label: "Permitted Rooms" },
  { to: "/profile",         icon: User,       label: "User Profile"    },
];

export const SideBar = () => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-[220px] z-40 border-r border-[#424753]/15 bg-[#0D0E13]/80 backdrop-blur-xl font-['Manrope'] antialiased tracking-tight hidden lg:flex flex-col py-6 shadow-[24px_0_48px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-6 mb-10">
          <h1 className="text-xl font-bold tracking-tighter text-[#e3e1e9]">
            The Vault
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9497a1] font-medium mt-1">
            Digital Curator
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/rooms"}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 px-6 py-3 text-[#4F8EF7] bg-[#4F8EF7]/10 border-l-2 border-[#4F8EF7] transition-all duration-300 ease-in-out"
                  : "flex items-center gap-3 px-6 py-3 text-[#9497a1] hover:bg-[#1E1F25] hover:text-[#e3e1e9] transition-all duration-300 ease-in-out hover:scale-[1.02]"
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
                  <span className="text-sm font-semibold">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer: user chip + logout */}
        <div className="mt-auto px-4 space-y-2">
          {user && (
            <div className="flex items-center gap-3 p-2 bg-[#1E1F25] rounded-xl">
              <div className="w-8 h-8 rounded-full border border-[#424753]/30 bg-[#292a2f] flex items-center justify-center text-xs font-bold text-[#acc7ff] shrink-0">
                {user.userName?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-[#e3e1e9]">
                  {user.userName}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#9497a1] hover:bg-[#1E1F25] hover:text-[#e3e1e9] transition-all duration-300 ease-in-out hover:scale-[1.02] rounded-lg"
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-safe h-16 bg-[#1E1F25]/90 backdrop-blur-lg border-t border-[#424753]/15 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] z-50">
        {navItems.slice(0, 3).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/rooms"}
            className={({ isActive }) =>
              isActive
                ? "flex flex-col items-center justify-center text-[#4F8EF7] py-2 scale-110 transition-transform"
                : "flex flex-col items-center justify-center text-[#9497a1] py-2 active:scale-95 transition-transform"
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="font-['Inter'] text-[10px] uppercase tracking-widest mt-1">
                  {label.split(" ")[0]}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};
