import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  Plus,
  Search,
  Camera,
  Cpu,
  ChevronRight,
  ArrowRight,
  MapPin,
  Megaphone,
  X,
  Droplet,
  Lightbulb,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CitizenLayout from "../../components/citizen/CitizenLayout";
import { Button } from "../../components/ui/Button";
import dashboardService from "../../services/dashboardService";
import complaintService from "../../services/complaintService";
import announcementService from "../../services/announcementService";
import notificationService from "../../services/notificationService";
import citizenBanner from "../../assets/citizen-banner.jpg";

// Curated realistic civic defect photography
import potholeImg from "../../assets/issues/pothole.jpg";
import garbageImg from "../../assets/issues/garbage.jpg";
import waterLeakageImg from "../../assets/issues/water-leakage.jpg";
import streetLightImg from "../../assets/issues/street-light.jpg";

export function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    assigned: 0,
    resolved: 0,
  });
  const [allComplaints, setAllComplaints] = useState([]);
  const [liveAnnouncements, setLiveAnnouncements] = useState([]);
  const [unreadNotices, setUnreadNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAllAnnouncementsModal, setShowAllAnnouncementsModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [dashRes, compRes, annRes, notifRes] = await Promise.allSettled([
          dashboardService.getCitizenDashboard(),
          complaintService.getMyComplaints(),
          announcementService.getAnnouncements(),
          notificationService.getNotifications(),
        ]);

        if (!mounted) return;

        if (annRes.status === "fulfilled" && Array.isArray(annRes.value)) {
          setLiveAnnouncements(annRes.value);
        }

        if (notifRes.status === "fulfilled" && Array.isArray(notifRes.value)) {
          const activeNotices = notifRes.value.filter(
            (n) => !n.isRead && (n.type === "Announcement" || n.message?.includes("📢") || n.message?.toLowerCase().includes("notice"))
          );
          setUnreadNotices(activeNotices);
        }

        if (compRes.status === "fulfilled" && Array.isArray(compRes.value)) {
          setAllComplaints(compRes.value);
          const total = compRes.value.length;
          const pend = compRes.value.filter((c) =>
            ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"].includes(c.status)
          ).length;
          const inProg = compRes.value.filter((c) =>
            ["In Progress", "Assigned", "Accepted and Assigned", "Reopened"].includes(c.status)
          ).length;
          const res = compRes.value.filter((c) =>
            ["Resolved", "Closed", "RESOLVED_AWAITING_FEEDBACK"].includes(c.status) || c.isClosed
          ).length;

          setStats({
            totalComplaints: total,
            pending: pend,
            assigned: inProg,
            resolved: res,
          });
        } else if (dashRes.status === "fulfilled" && dashRes.value) {
          setStats(dashRes.value);
        }
      } catch (err) {
        console.error("Citizen dashboard load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    // Listen for global notification update events from top navbar or other triggers
    const handleSyncNotices = async () => {
      try {
        const data = await notificationService.getNotifications();
        if (Array.isArray(data)) {
          const activeNotices = data.filter(
            (n) => !n.isRead && (n.type === "Announcement" || n.message?.includes("📢") || n.message?.toLowerCase().includes("notice"))
          );
          setUnreadNotices(activeNotices);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("notifications_updated", handleSyncNotices);

    return () => {
      mounted = false;
      window.removeEventListener("notifications_updated", handleSyncNotices);
    };
  }, []);

  // Mark single notice as read and dismiss from dashboard
  const handleMarkNoticeRead = async (noticeId) => {
    try {
      setUnreadNotices((prev) => prev.filter((n) => n._id !== noticeId));
      await notificationService.markAsRead(noticeId);
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.error("Failed to mark notice as read", err);
    }
  };

  // Mark all notices as read and dismiss from dashboard
  const handleMarkAllNoticesRead = async () => {
    try {
      setUnreadNotices([]);
      await notificationService.markAllAsRead();
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.error("Failed to mark all notices read", err);
    }
  };

  // Parse notice message text to extract clean title and body
  const parseNoticeMessage = (msg = "") => {
    const clean = msg.replace(/^📢\s*/, "");
    let title = "Official Civic Notice";
    let body = clean;

    if (clean.toLowerCase().startsWith("official civic notice:")) {
      const withoutPrefix = clean.slice("official civic notice:".length).trim();
      const parts = withoutPrefix.split(" - ");
      if (parts.length > 1) {
        title = parts[0].trim();
        body = parts.slice(1).join(" - ").trim();
      } else {
        body = withoutPrefix;
      }
    } else if (clean.includes(" - ")) {
      const parts = clean.split(" - ");
      title = parts[0].trim();
      body = parts.slice(1).join(" - ").trim();
    }

    return { title, body };
  };

  // Time-based greeting & user first name
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name
    ? user.name.replace(/\s*\(Citizen\)/i, "").trim().split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : "Citizen";

  // 4 Core Common Issues matching the 4-column layout in the screenshot
  const commonIssues = [
    {
      title: "Roads & Potholes",
      line1: "Roads &",
      line2: "Potholes",
      category: "Roads & Infrastructure",
      image: potholeImg,
    },
    {
      title: "Garbage Management",
      line1: "Garbage",
      line2: "Management",
      category: "Sanitation & Waste Management",
      image: garbageImg,
    },
    {
      title: "Water Leakage",
      line1: "Water",
      line2: "Leakage",
      category: "Water Supply & Drainage",
      image: waterLeakageImg,
    },
    {
      title: "Street Lighting",
      line1: "Street",
      line2: "Lighting",
      category: "Electricity & Power",
      image: streetLightImg,
    },
  ];

  // Helper for dynamic announcement icons
  const getAnnouncementIcon = (category = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("water")) return <Droplet className="h-4 w-4 text-slate-500" />;
    if (cat.includes("electric") || cat.includes("light")) return <Lightbulb className="h-4 w-4 text-slate-500" />;
    if (cat.includes("garbage") || cat.includes("sanitation")) return <Trash2 className="h-4 w-4 text-slate-500" />;
    return <FileText className="h-4 w-4 text-slate-500" />;
  };

  const announcementsList = Array.isArray(liveAnnouncements) ? liveAnnouncements : [];

  return (
    <CitizenLayout>
      <div className="space-y-6 w-full min-w-0">
        {/* ============================================================== */}
        {/* ROW 1: HERO BANNER (Matches screenshot layout & muted palette) */}
        {/* ============================================================== */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs min-h-[190px] sm:min-h-[210px] flex items-center">
          {/* Panoramic Skyline Photograph on Right */}
          <img
            src={citizenBanner}
            alt="City skyline"
            className="absolute inset-0 h-full w-full object-cover object-right pointer-events-none"
          />

          {/* Smooth Fade Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 sm:via-white/75 to-transparent" />

          {/* Banner Left Content */}
          <div className="relative z-10 max-w-lg p-6 sm:p-8 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              WELCOME BACK,
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {greeting}, {firstName}!
            </h1>

            <p className="text-xs text-slate-500 font-normal leading-normal max-w-sm">
              Report issues. Build a cleaner, safer and better city.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="bg-[#0E1B38] hover:bg-[#162544] text-white font-medium text-xs px-4 py-2 h-9 rounded-lg shadow-xs cursor-pointer transition gap-1.5"
              >
                <Link to="/citizen/raise">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Report an Issue</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-4 py-2 h-9 rounded-lg shadow-2xs border border-slate-200 cursor-pointer transition gap-1.5"
              >
                <Link to="/citizen/track">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <span>Track Status</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Floating Quote Card (Translucent glass card from reference screenshot) */}
          <div className="hidden lg:flex items-start gap-3 bg-white/85 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 max-w-xs absolute right-8 z-10">
            <span className="text-3xl font-serif text-slate-300 leading-none select-none">“</span>
            <p className="text-xs text-slate-600 font-medium italic leading-relaxed pt-1">
              Cleaner cities today, brighter tomorrows.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 1.5: OFFICIAL CIVIC NOTICES BANNER                         */}
        {/* (Appears when active notice exists; removed on Mark as Read)    */}
        {/* ============================================================== */}
        {unreadNotices.length > 0 && (
          <div className="space-y-3 pt-1">
            {unreadNotices.length > 1 && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-500">
                  {unreadNotices.length} Unread Civic Notices
                </span>
                <button
                  type="button"
                  onClick={handleMarkAllNoticesRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Mark all notices as read
                </button>
              </div>
            )}

            {unreadNotices.map((notice) => {
              const { title, body } = parseNoticeMessage(notice.message);
              return (
                <div
                  key={notice._id}
                  className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white p-4 sm:p-5 shadow-2xs transition-all duration-300 animate-in fade-in slide-in-from-top-1"
                >
                  {/* Left Amber Accent Bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500 rounded-l-2xl" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200/80 shrink-0 mt-0.5">
                        <Megaphone className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 border border-amber-200">
                            Civic Notice
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {notice.createdAt
                              ? new Date(notice.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recent"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleMarkNoticeRead(notice._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition hover:border-slate-400 cursor-pointer active:scale-95"
                        title="Mark notice as read and dismiss from dashboard"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Mark as Read</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* ROW 2: 4 METRIC STATUS CARDS WITH SPARKLINE WAVES              */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Complaints */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.totalComplaints}</p>
                <p className="text-[11px] text-slate-400 font-medium">Total Complaints</p>
              </div>
            </div>
            {/* Sparkline curve */}
            <svg className="w-16 h-8 text-blue-400 shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 24 C 20 22, 35 15, 50 18 C 58 20, 64 6, 68 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 2. Pending */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.pending}</p>
                <p className="text-[11px] text-slate-400 font-medium">Pending</p>
              </div>
            </div>
            {/* Sparkline curve */}
            <svg className="w-16 h-8 text-amber-400 shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 18 C 18 20, 30 26, 45 15 C 55 7, 62 12, 68 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 3. In Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <RotateCw className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.assigned}</p>
                <p className="text-[11px] text-slate-400 font-medium">In Progress</p>
              </div>
            </div>
            {/* Sparkline curve */}
            <svg className="w-16 h-8 text-slate-300 shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 15 C 20 15, 35 15, 50 15 C 58 15, 64 15, 68 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* 4. Resolved */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{stats.resolved}</p>
                <p className="text-[11px] text-slate-400 font-medium">Resolved</p>
              </div>
            </div>
            {/* Sparkline curve */}
            <svg className="w-16 h-8 text-emerald-400 shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 26 C 22 24, 38 18, 52 10 C 58 6, 64 8, 68 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 3: TWO 50/50 COLUMNS (Common Issues & My Recent Grievances) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Common Issues in Your Area */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Common Issues in Your Area</h2>
                <p className="text-xs text-slate-400 mt-0.5">Quickly report common civic problems</p>
              </div>
              <Link
                to="/citizen/raise"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* 4 Photo Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {commonIssues.map((issue) => (
                <Link
                  key={issue.title}
                  to={`/citizen/grievance-center?category=${encodeURIComponent(issue.category)}&title=${encodeURIComponent(issue.title)}`}
                  className="group relative rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-2xs hover:shadow-md transition-all duration-300 h-32 sm:h-36 flex flex-col justify-end p-2 cursor-pointer"
                >
                  {/* Photo */}
                  <img
                    src={issue.image}
                    alt={issue.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Bottom Pill Label matching reference screenshot with 2-line layout without truncation */}
                  <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-2 flex items-center justify-between text-white border border-white/15 shadow-xs">
                    <div className="leading-tight min-w-0 pr-1">
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {issue.line1}
                      </div>
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {issue.line2}
                      </div>
                    </div>
                    <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1 group-hover:bg-blue-600 transition-colors">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: My Recent Grievances (Table / list view matching reference screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                My Recent Grievances ({allComplaints.length})
              </h2>
              <Link
                to="/citizen/complaints"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {allComplaints && allComplaints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                      <th className="pb-2 font-medium">Issue</th>
                      <th className="pb-2 font-medium">ID</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allComplaints.slice(0, 3).map((comp) => {
                      const trackingId =
                        comp.complaintNumber || `#GRV-${new Date(comp.createdAt).getFullYear()}-${comp._id.slice(-3).toUpperCase()}`;

                      // Determine status pill color (subtle, clean, muted)
                      let statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                      let displayStatus = comp.status;
                      if (comp.status === "Closed" || comp.status === "Resolved") {
                        statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      } else if (comp.status === "Under Manual Review" || comp.status?.includes("Review")) {
                        statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
                        displayStatus = "Under Review";
                      } else if (comp.status === "In Progress" || comp.status === "Accepted and Assigned") {
                        statusBadge = "bg-sky-50 text-sky-700 border-sky-200";
                      } else if (comp.status === "Rejected") {
                        statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
                      }

                      const compImg = comp.image || comp.imageUrl || comp.photos?.[0];

                      return (
                        <tr key={comp._id} className="hover:bg-slate-50/60 transition group">
                          {/* Issue with thumbnail if available */}
                          <td className="py-2.5 pr-2">
                            <div className="flex items-center gap-2 max-w-[150px]">
                              {compImg ? (
                                <img
                                  src={compImg}
                                  alt=""
                                  className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                  <FileText className="h-4 w-4" />
                                </div>
                              )}
                              <span className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {comp.title}
                              </span>
                            </div>
                          </td>

                          {/* ID */}
                          <td className="py-2.5 px-2 text-slate-400 font-mono text-[11px]">
                            {trackingId}
                          </td>

                          {/* Date */}
                          <td className="py-2.5 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(comp.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          {/* Status Pill */}
                          <td className="py-2.5 px-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge}`}>
                              {displayStatus}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-2.5 pl-2 text-right">
                            <Link
                              to={`/citizen/complaints/${comp._id}`}
                              className="inline-flex h-6 w-6 rounded-full border border-slate-200 items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-400 transition"
                              title="View details"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <FileText className="h-8 w-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No grievances submitted yet</p>
                <p className="text-[11px] text-slate-400">Report an issue to start tracking its resolution.</p>
                <div className="pt-2">
                  <Button asChild size="sm" className="bg-[#0E1B38] hover:bg-[#162544] text-white text-xs h-8 px-4 rounded-lg">
                    <Link to="/citizen/raise">
                      <Plus className="h-3 w-3 mr-1" /> Report Issue
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 4: TWO 50/50 COLUMNS (How It Works? & Live Civic Updates)  */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: How It Works? (3 horizontal connected steps) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">How It Works?</h2>
                <p className="text-xs text-slate-400 mt-0.5">Report an issue in 3 simple steps</p>
              </div>
              <Link
                to="/citizen/track"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View Guide</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* 3 Connected Steps Horizontal Row */}
            <div className="grid grid-cols-3 gap-3 items-center pt-2">
              {/* Step 1 */}
              <div className="relative space-y-2">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">01</span>
                  <h4 className="text-xs font-bold text-slate-900">Report</h4>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                    Upload photo, add location and describe the issue.
                  </p>
                </div>
                {/* Arrow to Step 2 */}
                <div className="hidden sm:block absolute top-3 -right-2 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative space-y-2">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">02</span>
                  <h4 className="text-xs font-bold text-slate-900">AI Analysis</h4>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                    We detect category, check duplicates and route to the right department.
                  </p>
                </div>
                {/* Arrow to Step 3 */}
                <div className="hidden sm:block absolute top-3 -right-2 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative space-y-2">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">03</span>
                  <h4 className="text-xs font-bold text-slate-900">Track &amp; Resolve</h4>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                    Track live status and get notified on updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Civic Updates (Dynamic notices from MongoDB) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900">Live Civic Updates</h2>
              {announcementsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllAnnouncementsModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* List */}
            {announcementsList.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <Megaphone className="h-7 w-7 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No active civic updates</p>
                <p className="text-[11px] text-slate-400">Notices from municipal departments will appear here.</p>
              </div>
            ) : (
              <div className="pt-2 space-y-2 max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                {announcementsList.slice(0, 3).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {getAnnouncementIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(item.createdAt || Date.now()).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODAL: SINGLE ANNOUNCEMENT DETAIL VIEW                         */}
        {/* ============================================================== */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {selectedAnnouncement.category || "Civic Advisory"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                      {selectedAnnouncement.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedAnnouncement.message}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Target Area</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedAnnouncement.targetWard || "All Municipal Wards"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Date Issued</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {new Date(selectedAnnouncement.createdAt || Date.now()).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-[#0E1B38] hover:bg-[#162544] text-white font-medium text-xs rounded-lg h-8 px-4 cursor-pointer"
                >
                  Close Notice
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: ALL CIVIC ANNOUNCEMENTS BOARD                           */}
        {/* ============================================================== */}
        {showAllAnnouncementsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Civic Announcements &amp; Public Notices
                    </h3>
                    <p className="text-xs text-slate-400">
                      Official notices published by municipal authorities.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllAnnouncementsModal(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                {announcementsList.map((ann, idx) => (
                  <div
                    key={ann._id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.createdAt || Date.now()).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {ann.message}
                    </p>

                    {ann.targetWard && (
                      <span className="text-[10px] text-slate-400 font-medium block pt-0.5">
                        📍 Target Area: {ann.targetWard}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={() => setShowAllAnnouncementsModal(false)}
                  className="bg-[#0E1B38] hover:bg-[#162544] text-white font-medium text-xs rounded-lg h-8 px-4 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}

export default CitizenDashboard;