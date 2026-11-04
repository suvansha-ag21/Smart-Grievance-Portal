import React from "react";
import { Link, useNavigate } from "react-router-dom";
import GovernmentSidebar from "./GovernmentSidebar";
import { Bell, Shield, Home, Search, User, Calendar, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function GovernmentLayout({ children, title, subtitle }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGlobalSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      navigate(`/government/complaints?search=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cleanName = user?.name ? user.name.replace(/\s*\(Officer\)/i, "").trim() : "Vikram Malhotra";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden w-full">
      <GovernmentSidebar />

      <div className="flex flex-1 flex-col min-w-0 w-full overflow-x-hidden lg:pl-64">
        {/* Top Navbar matching the lightened, executive design */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-2xs w-full min-w-0 gap-4">
          {/* Global Search Bar */}
          <div className="flex items-center relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              onKeyDown={handleGlobalSearch}
              placeholder="Search complaints, officers, or depts..."
              className="h-9 w-full pl-9 pr-4 text-xs rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition font-normal"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Date Pill */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Location Pill */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
              <span className="text-slate-400">📍</span>
              <span>{user?.city || user?.address || "New Delhi"}</span>
            </div>

            {/* Go to Home */}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
              title="Return to Public Homepage"
            >
              <Home className="h-3.5 w-3.5 text-slate-400" />
              <span>Go to Home</span>
            </Link>

            {/* Notifications Bell with unread dot */}
            <div className="relative">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-2xs hover:bg-slate-50 relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>

            {/* Officer Profile Avatar Chip */}
            <Link
              to="/government/settings"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100/80 transition"
            >
              <div className="h-7 w-7 rounded-full bg-[#0E1B38] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {cleanName.charAt(0) || "V"}
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                  {cleanName}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  Chief Officer
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden xl:block" />
            </Link>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default GovernmentLayout;
