import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  MapPin,
  FileBarChart,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  User,
  Home,
  Megaphone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/government/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/government/complaints", label: "Department Queues", icon: ClipboardList },
  { to: "/government/ai-review", label: "AI Review Center", icon: Sparkles },
  { to: "/government/reports", label: "Reports", icon: FileBarChart },
  { to: "/government/announcements", label: "Announcements", icon: Megaphone },
  { to: "/government/settings", label: "Settings", icon: Settings },
];

export function GovernmentSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cleanName = user?.name ? user.name.replace(/\s*\(Officer\)/i, "").trim() : "Vikram Malhotra";

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0E1B38] p-5 text-white">
      <div>
        {/* Branding matching screenshot */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link to="/government/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-white">
                Smart Grievance
              </span>
              <span className="block text-[11px] font-semibold text-blue-300">
                Government Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#162544] text-white border border-white/10 shadow-xs font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Civic Building Graphic, Officer Profile & Logout */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        {/* Rashtrapati Bhavan Dome Graphic Silhouette */}
        <div className="w-full h-12 opacity-30 flex items-end justify-center px-2">
          <svg viewBox="0 0 160 50" className="w-full h-full fill-blue-300">
            <rect x="10" y="28" width="140" height="20" rx="1" />
            <rect x="25" y="20" width="110" height="10" />
            <path d="M 60 20 Q 80 0 100 20 Z" />
            <rect x="78" y="2" width="4" height="6" />
            <circle cx="80" cy="1" r="1.5" />
            <line x1="35" y1="28" x2="35" y2="48" stroke="#0E1B38" strokeWidth="2" />
            <line x1="50" y1="28" x2="50" y2="48" stroke="#0E1B38" strokeWidth="2" />
            <line x1="65" y1="28" x2="65" y2="48" stroke="#0E1B38" strokeWidth="2" />
            <line x1="95" y1="28" x2="95" y2="48" stroke="#0E1B38" strokeWidth="2" />
            <line x1="110" y1="28" x2="110" y2="48" stroke="#0E1B38" strokeWidth="2" />
            <line x1="125" y1="28" x2="125" y2="48" stroke="#0E1B38" strokeWidth="2" />
          </svg>
        </div>

        {/* Officer Profile Chip */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white font-bold shrink-0 text-xs">
            {cleanName.charAt(0) || "V"}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-black text-white">{cleanName}</p>
            <p className="text-[10px] font-medium text-blue-300">Chief Officer</p>
          </div>
        </div>

        {/* Red Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors px-2 pt-1 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-[#0E1B38] p-4 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
          <span className="font-extrabold text-sm">Government Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default GovernmentSidebar;
