import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  PlusCircle,
  ListChecks,
  User,
  LogOut,
  Home,
  Bell,
  Check,
  Clock,
  X,
  AlertCircle,
  Search,
  Compass,
  HelpCircle,
  Menu,
  ChevronDown,
  MapPin,
  Sparkles,
  FileText,
  PhoneCall,
  ExternalLink,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import notificationService from "../../services/notificationService";
import citizenAvatar from "../../assets/citizen.jpg";
import LocationSelectorModal from "./LocationSelectorModal";

export function CitizenLayout({ children }) {
  const { user, logout, selectedLocation } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const navigationItems = [
    { to: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/citizen/raise", label: "Report an Issue", icon: PlusCircle },
    { to: "/citizen/complaints", label: "My Complaints", icon: FileText },
    { to: "/citizen/track", label: "Track Status", icon: Compass },
    { to: "#notifications", label: "Notifications", icon: Bell, isNotification: true },
  ];

  const secondaryNavigationItems = [
    { to: "#help", label: "Help & Support", icon: HelpCircle, isHelp: true },
    { to: "/citizen/profile", label: "Profile", icon: User },
    { to: "/citizen/profile", label: "Settings", icon: Settings },
  ];

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
        const unread = data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    const onSync = () => fetchNotifications();
    window.addEventListener("notifications_updated", onSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications_updated", onSync);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      window.dispatchEvent(new Event("notifications_updated"));
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkSingleRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event("notifications_updated"));
    } catch {
      // ignore
    }
  };

  // Clean user display name
  const displayName = user?.name
    ? user.name.replace(/\s*\(Citizen\)/i, "").trim()
    : user?.email
    ? user.email.split("@")[0]
    : "Citizen User";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex overflow-x-hidden w-full">
      {/* 1. DEEP NAVY BLUE SIDEBAR - FIXED FULL HEIGHT (inset-y-0 left-0 w-64) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0E1B38] text-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link to="/citizen/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <span className="block text-base font-black tracking-tight text-white">
                Smart Grievance
              </span>
              <span className="block text-[11px] font-bold text-blue-300">
                Citizen Portal
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto min-h-0">
          {navigationItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to === "/citizen/dashboard" && location.pathname === "/citizen");
            const Icon = item.icon;

            if (item.isNotification) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setShowNotifications(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="grid h-4 min-w-4 px-1 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? "bg-[#162544] text-white border border-white/10 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Thin Divider Line */}
          <div className="pt-3 pb-2">
            <div className="border-t border-white/10" />
          </div>

          {/* Secondary Navigation */}
          {secondaryNavigationItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;

            if (item.isHelp) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setShowHelpModal(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? "bg-[#162544] text-white border border-white/10 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Skyline Graphic & Tagline */}
        <div className="p-4 border-t border-white/10 space-y-2 shrink-0 text-center">
          {/* Skyline vector graphic line art */}
          <div className="w-full h-14 opacity-50 flex items-end justify-center px-4">
            <svg viewBox="0 0 160 50" className="w-full h-full stroke-blue-400/80 fill-none" strokeWidth="1.2">
              <rect x="10" y="24" width="14" height="26" />
              <rect x="28" y="14" width="16" height="36" />
              <line x1="36" y1="6" x2="36" y2="14" />
              <rect x="48" y="22" width="12" height="28" />
              <rect x="64" y="10" width="22" height="40" />
              <line x1="75" y1="2" x2="75" y2="10" />
              <rect x="90" y="26" width="14" height="24" />
              <rect x="108" y="16" width="18" height="34" />
              <rect x="130" y="28" width="16" height="22" />
            </svg>
          </div>

          <div className="space-y-0.5 text-[11px] text-slate-400 font-medium">
            <p>Cleaner Cities</p>
            <p className="text-slate-500">Stronger Communities</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. MAIN VIEWPORT AREA (Scrolls smoothly with lg:pl-64 while sidebar stays fixed) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden lg:pl-64">
        {/* TOP NAVBAR / HEADER */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
          {/* Mobile hamburger button & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search Bar (Pill style matching reference screenshot) */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues, departments, or keywords..."
                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-xs font-normal text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Go to Home Button */}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Home className="h-3.5 w-3.5 text-slate-400" />
              <span>Go to Home</span>
            </Link>

            {/* Dynamic Location Pill (Click to Change) */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer max-w-[180px] group"
              title="Click to change your location / city"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{selectedLocation || "Select Location"}</span>
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Citizen Notifications
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                      <AlertCircle className="mx-auto h-6 w-6 text-slate-300" />
                      <p className="font-bold text-slate-700">No notifications yet</p>
                      <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                        You will receive updates when your grievances progress or notices are broadcasted.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`pt-2 pb-2 text-xs flex items-start justify-between gap-2 ${
                            n.isRead ? "text-slate-600" : "bg-blue-50/50 p-2.5 rounded-xl text-slate-900 font-medium"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="leading-snug">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {!n.isRead && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkSingleRead(n._id, e)}
                              className="shrink-0 text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-100/50 px-2 py-0.5 rounded border border-blue-200 transition cursor-pointer"
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Citizen Profile Chip */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100/80 transition cursor-pointer"
              >
                <div className="h-7 w-7 rounded-full bg-[#0E1B38] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700 hidden sm:block">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs">
                  <Link
                    to="/citizen/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold"
                  >
                    <ListChecks className="h-4 w-4 text-blue-600" />
                    <span>My Complaints</span>
                  </Link>
                  <Link
                    to="/citizen/track"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold"
                  >
                    <Compass className="h-4 w-4 text-blue-600" />
                    <span>Track Status</span>
                  </Link>
                  <div className="my-1 border-t" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Citizen Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Civic Help & Support
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 space-y-1">
                <p className="font-extrabold text-blue-900">National Citizen Grievance Helpline</p>
                <p className="text-blue-700 font-bold text-sm flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4" /> 1800-11-2233 (Toll Free)
                </p>
                <p className="text-[11px] text-blue-600">Available 24/7 for civic emergencies and safety hazards.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900">How to report a civic problem?</p>
                <p className="text-[11px] text-slate-500">
                  Click "+ Report New Grievance", provide an accurate location, select the problem category, and upload photographic evidence.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900">How does live tracking work?</p>
                <p className="text-[11px] text-slate-500">
                  Go to "Track Status" and enter your Grievance Tracking ID to view the 4-stage milestone progress from submission to resolution.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelpModal(false)}
                className="font-bold rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}

export default CitizenLayout;
