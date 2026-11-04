import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Search,
  ImageIcon,
  Megaphone,
  Compass,
  Droplets,
  Trash2,
  Zap,
  ShieldAlert,
  FolderOpen,
  ChevronRight,
  FileText,
} from "lucide-react";
import GovernmentLayout from "../../components/government/GovernmentLayout";
import { Badge } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import complaintService from "../../services/complaintService";
import governmentBanner from "../../assets/government-banner.jpg";

// Canonical Municipal Departments & Divisions with clean executive styling
const CANONICAL_DIVISIONS = [
  {
    id: "roads",
    name: "Roads Department",
    shortName: "Roads",
    aliases: ["Roads Department", "Roads & Infrastructure", "Roads"],
    icon: Compass,
    description: "Potholes, damaged asphalt, craters & footpaths.",
    defaultOfficer: "Rajesh Sharma",
  },
  {
    id: "water",
    name: "Water Supply Department",
    shortName: "Water Supply",
    aliases: ["Water Supply Department", "Water Supply & Drainage", "Water Supply"],
    icon: Droplets,
    description: "Pipeline bursts, low pressure & drinking water.",
    defaultOfficer: "Priya Verma",
  },
  {
    id: "sanitation",
    name: "Sanitation Department",
    shortName: "Sanitation",
    aliases: ["Sanitation Department", "Sanitation & Waste Management", "Sanitation", "Sanitation & Waste"],
    icon: Trash2,
    description: "Overflowing garbage, waste & open sewage.",
    defaultOfficer: "Amit Kumar",
  },
  {
    id: "electricity",
    name: "Electricity Department",
    shortName: "Electricity",
    aliases: ["Electricity Department", "Electricity & Power", "Electricity"],
    icon: Zap,
    description: "Damaged cables, live wires & streetlight outages.",
    defaultOfficer: "Sunita Rao",
  },
  {
    id: "safety",
    name: "Public Safety Department",
    shortName: "Public Safety",
    aliases: ["Public Safety Department", "Public Health & Safety", "Public Safety"],
    icon: ShieldAlert,
    description: "Deep open manholes, structural collapse & hazards.",
    defaultOfficer: "Inspector Meena Joshi",
  },
  {
    id: "other",
    name: "Other / Unclear Queue",
    shortName: "Verification Queue",
    aliases: ["Other Civic Issue", "Other", "Unclear", "Manual Verification Queue"],
    icon: FolderOpen,
    description: "Unclassified reports, slogans & ambiguous issues.",
    defaultOfficer: "Supervisor Queue",
  },
];

// Helper to match any complaint to its canonical department
function getComplaintDivisionId(c) {
  if (!c) return "other";
  const deptName = (
    typeof c.department === "object"
      ? c.department?.departmentName
      : c.department || c.category || ""
  ).toLowerCase();

  if (deptName.includes("road") || deptName.includes("pothole") || deptName.includes("footpath")) return "roads";
  if (deptName.includes("water") || deptName.includes("pipe") || deptName.includes("leak")) return "water";
  if (deptName.includes("sanitation") || deptName.includes("garbage") || deptName.includes("waste")) return "sanitation";
  if (deptName.includes("electric") || deptName.includes("power") || deptName.includes("light") || deptName.includes("wire")) return "electricity";
  if (deptName.includes("safety") || deptName.includes("hazard") || deptName.includes("danger") || deptName.includes("collapse")) return "safety";
  return "other";
}

export function GovernmentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state inside Assigned Complaints table
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const compRes = await complaintService.getAssignedComplaints();
        if (!mounted) return;
        if (Array.isArray(compRes)) {
          setComplaints(compRes);
        }
      } catch (err) {
        console.error("Government dashboard load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute live summary metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) =>
    ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"].includes(c.status)
  ).length;
  const inProgressCount = complaints.filter((c) =>
    ["In Progress", "Assigned", "Accepted and Assigned", "Reopened"].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) =>
    ["Resolved", "Closed", "RESOLVED_AWAITING_FEEDBACK"].includes(c.status) || c.isClosed
  ).length;
  const fakeOrRejectedCount = complaints.filter(
    (c) =>
      c.status === "Rejected" ||
      (c.aiFlag && (c.aiFlag.includes("Fake") || c.aiFlag.includes("Tampered") || c.aiFlag.includes("Duplicate") || c.aiFlag.includes("Unrelated") || c.aiFlag.includes("Non-Civic")))
  ).length;

  // Filtered complaints for the table
  const categories = ["All", ...new Set(complaints.map((c) => c.category).filter(Boolean))];

  const filteredComplaints = complaints.filter((c) => {
    const code = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Needs Attention: Strictly UNRESOLVED complaints with High/Critical priority, Pending, or AI Flag
  const needsAttention = complaints
    .filter(
      (c) =>
        c.status !== "Resolved" &&
        c.status !== "Rejected" &&
        (c.priority === "Critical" ||
          c.priority === "High" ||
          c.status === "Pending" ||
          (c.aiFlag && c.aiFlag !== "Clean" && c.aiFlag !== "Verified by Officer"))
    )
    .slice(0, 5);

  // Activity status dot with soft glow indicator
  const getActivityDot = (status = "") => {
    const s = String(status).toLowerCase();
    if (s.includes("resolved") || s.includes("closed")) return "bg-emerald-500 ring-4 ring-emerald-100";
    if (s.includes("reject")) return "bg-rose-500 ring-4 ring-rose-100";
    if (s.includes("progress") || s.includes("assigned")) return "bg-amber-500 ring-4 ring-amber-100";
    return "bg-blue-500 ring-4 ring-blue-100";
  };

  return (
    <GovernmentLayout
      title="Government Dashboard"
      subtitle="Monitor, review, and resolve citizen grievances efficiently."
    >
      <div className="space-y-6 w-full min-w-0">
        {/* 1. HERO BANNER WITH SUBTLE LIGHTENED OVERLAY */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs min-h-[190px] sm:min-h-[210px] flex items-center">
          {/* Panoramic Government Complex Image */}
          <img
            src={governmentBanner}
            alt="Central Secretariat"
            className="absolute inset-0 h-full w-full object-cover object-right sm:object-center pointer-events-none"
          />

          {/* Smooth Fade Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 sm:via-white/75 to-transparent" />

          {/* Top-Right Floating Jurisdiction Chip */}
          <div className="absolute top-5 right-6 z-10 hidden md:flex items-center gap-2.5 rounded-2xl bg-white/85 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-white/60">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <span className="block font-bold text-slate-900 leading-tight">
                {user?.address || (user?.department ? `${user.department} Division` : "Municipal Civic Operations")}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                Civic Grievance Redressal
              </span>
            </div>
          </div>

          {/* Banner Left Content */}
          <div className="relative z-10 max-w-xl p-6 sm:p-8 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              GOVERNMENT PORTAL
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Civic Grievances &amp; Operations
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-md">
              AI-driven real-time validation, duplicate detection, and automated routing for municipal governance.
            </p>

            {/* Quick Action */}
            <div className="pt-2 flex items-center gap-3">
              <Button asChild size="sm" className="bg-[#0E1B38] hover:bg-[#162544] text-white font-medium text-xs px-4 py-2 h-9 rounded-lg shadow-xs gap-1.5 cursor-pointer">
                <Link to="/government/announcements">
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>Broadcast Notice to Citizens</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. FIVE SUMMARY METRIC CARDS WITH CLEAN EXECUTIVE HIGHLIGHTS */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full min-w-0">
          {/* Card 1: Total Complaints */}
          <div className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{totalCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Total Complaints</p>
              </div>
            </div>
            <svg className="w-12 h-6 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 24 C 20 22, 35 15, 50 18 C 58 20, 64 6, 68 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card 2: Pending Review */}
          <div className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{pendingCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Pending Review</p>
              </div>
            </div>
            <svg className="w-12 h-6 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 18 C 18 20, 30 26, 45 15 C 55 7, 62 12, 68 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card 3: In Progress */}
          <div className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors">
                <Settings2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{inProgressCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">In Progress</p>
              </div>
            </div>
            <svg className="w-12 h-6 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 15 C 20 15, 35 15, 50 15 C 58 15, 64 15, 68 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Card 4: Resolved */}
          <div className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{resolvedCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Resolved</p>
              </div>
            </div>
            <svg className="w-12 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 26 C 22 24, 38 18, 52 10 C 58 6, 64 8, 68 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Card 5: Fake / Flagged */}
          <div className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{fakeOrRejectedCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Flagged by AI</p>
              </div>
            </div>
            <svg className="w-12 h-6 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" viewBox="0 0 70 30" fill="none">
              <path d="M2 20 C 18 16, 32 24, 48 12 C 58 6, 64 8, 68 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2.5 DEPARTMENT QUEUES */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Department Queues &amp; Workspaces
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Assigned grievances organized by civic division</p>
            </div>

            <Link
              to="/government/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Queues</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CANONICAL_DIVISIONS.map((division) => {
              const DivIcon = division.icon;
              const deptCount = complaints.filter(
                (c) => getComplaintDivisionId(c) === division.id && !c.isClosed && c.status !== "Closed"
              ).length;

              return (
                <Link
                  key={division.id}
                  to={`/government/complaints?department=${division.id}`}
                  className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors shadow-2xs">
                        <DivIcon className="h-4 w-4" />
                      </div>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
                        deptCount > 0
                          ? "bg-slate-900 text-white border-slate-900"
                          : "text-slate-400 bg-slate-50 border-slate-200"
                      }`}>
                        {deptCount}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {division.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-normal line-clamp-2 mt-1 leading-snug">
                        {division.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                    <span>Open Queue</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. TWO-COLUMN LOWER SECTION */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 w-full min-w-0 items-start">
          {/* Left Column: Recent Complaints Table (~68% width) */}
          <div className="lg:col-span-8 space-y-4 w-full min-w-0">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs w-full min-w-0 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">Recent Complaints</h3>
                <Link
                  to="/government/complaints"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Filter controls row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, title, or location..."
                    className="h-9 w-full pl-8.5 pr-3 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-700 focus:outline-none focus:border-slate-400"
                >
                  <option value="All">All Categories</option>
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-700 focus:outline-none focus:border-slate-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-700 focus:outline-none focus:border-slate-400"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                      <th className="pb-2 px-2 font-medium w-[120px]">ID</th>
                      <th className="pb-2 px-2 font-medium">Title</th>
                      <th className="pb-2 px-2 font-medium w-[110px]">Category</th>
                      <th className="pb-2 px-2 font-medium w-[110px]">Location</th>
                      <th className="pb-2 px-2 font-medium w-[75px]">Priority</th>
                      <th className="pb-2 px-2 font-medium w-[85px]">Status</th>
                      <th className="pb-2 px-2 font-medium w-[85px]">Date</th>
                      <th className="pb-2 px-2 font-medium w-[50px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Loading complaints…
                        </td>
                      </tr>
                    ) : filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-800 text-sm">No complaints found</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {complaints.length === 0
                              ? "The grievance registry is currently clean."
                              : "No complaints matching the active search or filters."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.slice(0, 6).map((c) => {
                        const imageSrc = c.image || c.imageUrl;
                        let statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                        let displayStatus = c.status;
                        if (c.status === "Closed" || c.status === "Resolved") {
                          statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        } else if (c.status === "Under Manual Review" || c.status?.includes("Review")) {
                          statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
                          displayStatus = "Under Review";
                        } else if (c.status === "In Progress" || c.status === "Accepted and Assigned") {
                          statusBadge = "bg-sky-50 text-sky-700 border-sky-200";
                        } else if (c.status === "Rejected") {
                          statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
                        }

                        return (
                          <tr key={c._id} className="hover:bg-slate-50/60 transition group">
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt=""
                                    className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                  </div>
                                )}
                                <span className="font-mono text-[11px] text-slate-500 font-medium">
                                  {c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`}
                                </span>
                              </div>
                            </td>

                            <td className="py-2.5 px-2 font-semibold text-slate-800 max-w-[150px] truncate group-hover:text-blue-600 transition-colors">
                              <Link
                                to={`/government/complaints?id=${c._id}`}
                                title={c.title}
                              >
                                {c.title}
                              </Link>
                            </td>

                            <td className="py-2.5 px-2 text-slate-400 max-w-[110px] truncate text-[11px]">
                              {c.category || "General"}
                            </td>

                            <td className="py-2.5 px-2 text-slate-400 max-w-[110px] truncate text-[11px]">
                              {c.location}
                            </td>

                            <td className="py-2.5 px-2 whitespace-nowrap">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                c.priority === "Critical"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                                  : c.priority === "High"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}>
                                {c.priority}
                              </span>
                            </td>

                            <td className="py-2.5 px-2 whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge}`}>
                                {displayStatus}
                              </span>
                            </td>

                            <td className="py-2.5 px-2 whitespace-nowrap text-slate-400 text-[11px]">
                              {new Date(c.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>

                            <td className="py-2.5 px-2 text-right whitespace-nowrap">
                              <Link
                                to={`/government/complaints?id=${c._id}`}
                                className="inline-flex h-6 w-6 rounded-full border border-slate-200 items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition"
                                title="View details"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Needs Attention & Recent Activity (~32% width) */}
          <div className="lg:col-span-4 space-y-4 w-full min-w-0">
            {/* Card 1: Needs Attention */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3 w-full min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h4>Needs Attention</h4>
                </div>
                {needsAttention.length > 0 && (
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 shadow-2xs">
                    {needsAttention.length} Urgent
                  </span>
                )}
              </div>

              {needsAttention.length === 0 ? (
                <div className="py-6 text-center space-y-1 text-slate-400">
                  <CheckCircle2 className="h-7 w-7 mx-auto text-emerald-500/80" />
                  <p className="text-xs font-medium text-slate-700">Queue is clear</p>
                  <p className="text-[11px]">No urgent issues currently flagged.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {needsAttention.map((c) => {
                    const img = c.image || c.imageUrl;
                    return (
                      <Link
                        key={c._id}
                        to={`/government/complaints?id=${c._id}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] text-slate-400">
                              {c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              c.priority === "Critical"
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : c.priority === "High"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {c.priority}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 truncate text-xs group-hover:text-blue-600 transition-colors">
                            {c.title}
                          </p>
                          <p className="text-slate-400 text-[10px] truncate">{c.location}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 2: Recent Activity */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3 w-full min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">Recent Activity</h4>
                <Link to="/government/complaints" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              {complaints.length === 0 ? (
                <div className="py-6 text-center space-y-1 text-slate-400">
                  <Clock className="h-7 w-7 mx-auto text-slate-300" />
                  <p className="text-xs font-medium text-slate-700">No activity yet</p>
                  <p className="text-[11px]">Grievance actions will log here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {complaints.slice(0, 4).map((c) => (
                    <div key={c._id} className="flex items-start gap-2.5 text-xs">
                      <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${getActivityDot(c.status)}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-700 leading-snug">
                          <Link
                            to={`/government/complaints?id=${c._id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 hover:underline font-mono text-[11px]"
                          >
                            {c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`}
                          </Link>{" "}
                          is <span className="font-medium text-slate-900">{c.status}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {c.location} • {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GovernmentLayout>
  );
}

export default GovernmentDashboard;