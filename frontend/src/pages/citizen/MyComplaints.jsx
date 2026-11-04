import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Plus,
  AlertCircle,
  ArrowRight,
  Image as ImageIcon,
  Tag,
  CheckCircle,
  Clock,
  Sparkles,
  Compass,
  Printer,
  ShieldCheck,
  Archive,
  Star,
  FileCheck,
} from "lucide-react";
import CitizenLayout from "../../components/citizen/CitizenLayout";
import { Button } from "../../components/ui/Button";
import { Input, Badge } from "../../components/ui/Input";
import complaintService from "../../services/complaintService";
import { ComplaintReceiptModal } from "../../components/citizen/ComplaintReceiptModal";

export function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("active"); // "active" | "history"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [activeReceiptComplaint, setActiveReceiptComplaint] = useState(null);

  const fetchComplaints = async (isHistory) => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints({ history: isHistory ? "true" : "false" });
      if (Array.isArray(data)) setComplaints(data);
      else setComplaints([]);
    } catch (err) {
      console.error(err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(viewMode === "history");
  }, [viewMode]);

  const filtered = complaints.filter((c) => {
    const code = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusCount = (status) => {
    if (status === "All") return complaints.length;
    return complaints.filter((c) => c.status === status).length;
  };

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Page Title & Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-black text-[#0B1736]">
              {viewMode === "history" ? "Resolved & Closed History Archive" : "My Active Grievances"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {viewMode === "history"
                ? "Official archive of closed grievances and citizen satisfaction records."
                : "Search, inspect, and track real-time resolution updates for active civic complaints."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="hero" size="lg" className="shadow-md">
              <Link to="/citizen/raise">
                <Plus className="h-4 w-4" /> Report New Grievance
              </Link>
            </Button>
          </div>
        </div>

        {/* View Mode Tabs: Active vs Closed History */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => {
              setViewMode("active");
              setStatusFilter("All");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              viewMode === "active"
                ? "bg-[#0B1736] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Active Complaints Queue</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("history");
              setStatusFilter("All");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              viewMode === "history"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>Complaint History &amp; Resolved Archive</span>
          </button>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid gap-3 md:grid-cols-[1.5fr_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Grievance ID, title, keyword, or landmark..."
                className="pl-11"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(viewMode === "active"
              ? ["All", "Submitted — Awaiting Validation", "Accepted and Assigned", "In Progress", "Under Manual Review", "Needs More Information", "Resolved", "Reopened"]
              : ["All", "Closed", "Resolved"]
            ).map((s) => {
              const count = getStatusCount(s);
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-xl px-3 py-1.5 font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-[#0B1736] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{s}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Complaints List / Cards */}
        {loading ? (
          <p className="py-20 text-center text-xs text-slate-400">Loading grievance records…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-extrabold text-[#0B1736]">
              {viewMode === "history" ? "No archived closed grievances" : "No active grievances found"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "All" || priorityFilter !== "All"
                ? "No complaints match your active filters. Try clearing search keyword or reset status filters."
                : viewMode === "history"
                ? "When your resolved grievances are confirmed satisfied, they will appear here in your permanent archive."
                : "You have no pending or active grievances currently undergoing redressal."}
            </p>
            {search || statusFilter !== "All" || priorityFilter !== "All" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                }}
                className="mt-5"
              >
                Clear All Filters
              </Button>
            ) : viewMode === "active" ? (
              <Button asChild variant="hero" size="sm" className="mt-5">
                <Link to="/citizen/raise">
                  <Plus className="h-4 w-4" /> Report an Issue
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((c) => {
              const trackingId = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
              const deptName =
                typeof c.department === "object"
                  ? c.department?.departmentName
                  : c.department || "Municipal Division";

              const isItemClosed = c.isClosed || c.status === "Closed";

              return (
                <div
                  key={c._id}
                  className={`rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                    isItemClosed ? "bg-slate-50/80 border-emerald-200" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Header: Photo Thumbnail + ID + Badges */}
                    <div className="flex items-start gap-3.5">
                      {/* Photo Thumbnail */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {c.resolutionImage && isItemClosed ? (
                          <img
                            src={c.resolutionImage}
                            alt="Resolution evidence"
                            className="h-full w-full object-cover"
                          />
                        ) : c.image ? (
                          <img
                            src={c.image}
                            alt="Complaint evidence"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-7 w-7 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-blue-700">{trackingId}</span>
                          <Badge variant={c.status}>{c.status}</Badge>
                        </div>
                        <h3 className="font-extrabold text-sm text-[#0B1736] truncate leading-snug">
                          {c.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>{c.location || "Location recorded"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Department & Submission Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">{deptName}</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Closed satisfaction indicator */}
                    {isItemClosed && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-100/60 text-emerald-900 text-xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <FileCheck className="h-4 w-4 text-emerald-700" />
                          <span>Satisfied &amp; Closed</span>
                        </div>
                        {c.citizenSatisfaction?.feedbackRating && (
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span>{c.citizenSatisfaction.feedbackRating}/5 Stars</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveReceiptComplaint(c)}
                      className="text-xs font-bold text-slate-600 hover:text-navy flex items-center gap-1 transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Receipt</span>
                    </button>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold gap-1">
                      <Link to={`/citizen/complaints/${c._id}`}>
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Printable Official Grievance Receipt Modal */}
        {activeReceiptComplaint && (
          <ComplaintReceiptModal
            complaint={activeReceiptComplaint}
            isOpen={Boolean(activeReceiptComplaint)}
            onClose={() => setActiveReceiptComplaint(null)}
          />
        )}
      </div>
    </CitizenLayout>
  );
}

export default MyComplaints;
