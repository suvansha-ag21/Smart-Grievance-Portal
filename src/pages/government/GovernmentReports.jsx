import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Building2,
  TrendingUp,
  Award,
  Download,
  Filter,
  Calendar,
  Shield,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import GovernmentLayout from "../../components/government/GovernmentLayout";
import { Badge } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import complaintService from "../../services/complaintService";
import departmentService from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";

export function GovernmentReports() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("oct_2026"); // 1 Oct 2026 - 25 Oct 2026

  useEffect(() => {
    async function load() {
      try {
        const [compData, deptData] = await Promise.allSettled([
          complaintService.getAssignedComplaints(),
          departmentService.getDepartments(),
        ]);

        if (compData.status === "fulfilled" && Array.isArray(compData.value)) {
          setComplaints(compData.value);
        }
        if (deptData.status === "fulfilled" && Array.isArray(deptData.value)) {
          setDepartments(deptData.value);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter complaints by selected Date Range
  const now = new Date();
  const filteredComplaints = complaints.filter((c) => {
    if (dateRange === "all") return true;
    const created = new Date(c.createdAt);
    if (isNaN(created.getTime())) return true;

    if (dateRange === "today") {
      return created.toDateString() === now.toDateString();
    }
    if (dateRange === "7days") {
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }
    if (dateRange === "30days") {
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }
    return true; // oct_2026 / all
  });

  // Department-Level Metrics (Across filtered complaints)
  const total = filteredComplaints.length;
  const resolved = filteredComplaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed" || c.status === "RESOLVED_AWAITING_FEEDBACK" || c.isClosed
  ).length;
  const pending = filteredComplaints.filter(
    (c) => ["Pending", "Submitted — Awaiting Validation", "Needs More Information", "Under Manual Review"].includes(c.status)
  ).length;
  const inProgress = filteredComplaints.filter(
    (c) => ["In Progress", "Assigned", "Accepted and Assigned", "Reopened"].includes(c.status)
  ).length;

  // Safe completion rate: strictly handles zero denominator correctly
  const overallResolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const resolutionRateFormatted = total > 0 ? `${overallResolutionRate}%` : "0%";

  // Priority Breakdown
  const criticalCount = filteredComplaints.filter((c) => c.priority === "Critical").length;
  const highCount = filteredComplaints.filter((c) => c.priority === "High").length;
  const medCount = filteredComplaints.filter((c) => c.priority === "Medium").length;
  const lowCount = filteredComplaints.filter((c) => c.priority === "Low").length;

  // Officer-Level Metrics
  const officerId = user?._id;
  const myAssignedComplaints = filteredComplaints.filter(
    (c) =>
      String(c.assignedOfficer?._id || c.assignedOfficer) === String(officerId) ||
      (c.assignedOfficer?.name && c.assignedOfficer?.name === user?.name)
  );
  const myTotal = myAssignedComplaints.length;
  const myResolved = myAssignedComplaints.filter((c) => c.status === "Resolved").length;

  // CSV Export Function
  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      toast.error("No complaint records found in selected range to export.");
      return;
    }

    const headers = [
      "Complaint ID",
      "Title",
      "Category",
      "Department",
      "Location",
      "Priority",
      "Status",
      "Reported Date",
      "Official Remarks",
    ];

    const rows = filteredComplaints.map((c) => {
      const code = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
      const title = `"${(c.title || "").replace(/"/g, '""')}"`;
      const cat = `"${(c.category || "General").replace(/"/g, '""')}"`;
      const dept = `"${(c.department?.departmentName || "Municipal Redressal").replace(/"/g, '""')}"`;
      const loc = `"${(c.location || "").replace(/"/g, '""')}"`;
      const pri = c.priority || "Medium";
      const stat = c.status || "Pending";
      const date = new Date(c.createdAt).toLocaleDateString("en-IN");
      const remarks = `"${(c.remarks || "No remarks").replace(/"/g, '""')}"`;

      return [code, title, cat, dept, loc, pri, stat, date, remarks].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Civic_Grievance_Audit_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredComplaints.length} records to CSV successfully!`);
  };

  return (
    <GovernmentLayout
      title="Reports & Analytics"
      subtitle="Comprehensive data on complaints, resolution times, and department performance."
    >
      <div className="space-y-6 w-full min-w-0">
        {/* Header Bar with Date Range Pill & Export Report Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Tuesday, 27 October 2026</span>
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="oct_2026">All Departments</option>
              <option value="all">All Time Records</option>
              <option value="today">Today's Inflow</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <Button
            onClick={handleExportCSV}
            className="gap-2 bg-[#0E1B38] hover:bg-[#162544] text-white font-medium text-xs px-4 py-2 rounded-lg shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Card 1: Resolution Rate */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Resolution Rate</span>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {total > 0 ? resolutionRateFormatted : "0%"}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> {resolved} Resolved
              </span>
              <span className="text-xs text-slate-400">of {total} total</span>
            </div>
          </div>

          {/* Card 2: Avg. Resolution Time */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Active Work Orders</span>
              <p className="text-3xl font-bold text-slate-900 mt-2">{inProgress}</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 border border-sky-200">
                {pending} Pending
              </span>
              <span className="text-xs text-slate-400">awaiting field review</span>
            </div>
          </div>

          {/* Card 3: AI Detections */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">AI Flagged Submissions</span>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {filteredComplaints.filter((c) => c.aiFlag && c.aiFlag !== "Clean" && c.aiFlag !== "Verified by Officer").length}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                AI Inspected
              </span>
              <span className="text-xs text-slate-400">Duplicates &amp; flags</span>
            </div>
          </div>
        </div>

        {/* Analytics Visuals Grid (Resolution Trend, Category Distribution, Department Performance) */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
          {/* Resolution Trend Chart (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Resolution Trend</h3>
                <p className="text-[11px] text-slate-500">Weekly resolution volume</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                +14% Growth
              </span>
            </div>

            {/* SVG Visual Curve */}
            <div className="h-44 w-full pt-2">
              <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="300" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path
                  d="M 10 95 Q 60 75 100 80 T 180 50 T 250 40 L 290 25 L 290 110 L 10 110 Z"
                  fill="url(#trendGradient)"
                />
                {/* Trend Line */}
                <path
                  d="M 10 95 Q 60 75 100 80 T 180 50 T 250 40 L 290 25"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Points */}
                <circle cx="10" cy="95" r="3.5" fill="#2563EB" />
                <circle cx="100" cy="80" r="3.5" fill="#2563EB" />
                <circle cx="180" cy="50" r="3.5" fill="#2563EB" />
                <circle cx="250" cy="40" r="3.5" fill="#2563EB" />
                <circle cx="290" cy="25" r="4.5" fill="#ffffff" stroke="#2563EB" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Complaints by Category (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Complaints by Category</h3>
                <p className="text-[11px] text-slate-500">Distribution across civic departments</p>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {total} Total Issues
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: "Roads & Infrastructure", pct: 38, count: 18, color: "bg-blue-600" },
                { name: "Sanitation & Waste Management", pct: 26, count: 12, color: "bg-emerald-600" },
                { name: "Water Supply & Drainage", pct: 18, count: 8, color: "bg-cyan-600" },
                { name: "Electricity & Power", pct: 12, count: 5, color: "bg-amber-500" },
                { name: "Public Health & Safety", pct: 6, count: 3, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.name}</span>
                    <span className="text-slate-500">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department-wise Performance Table - matching Screen 5 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Department-wise Performance
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              Updated live from database
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned</th>
                  <th className="py-3.5 px-4">Resolved</th>
                  <th className="py-3.5 px-4">Pending</th>
                  <th className="py-3.5 px-4">Resolution Rate</th>
                  <th className="py-3.5 px-4 text-right">Avg. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No department data available.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => {
                    const deptComplaints = filteredComplaints.filter(
                      (c) =>
                        c.department?.departmentName === dept.departmentName ||
                        c.category === dept.departmentName
                    );
                    const deptAssigned = deptComplaints.length;
                    const deptResolved = deptComplaints.filter((c) => c.status === "Resolved").length;
                    const deptPending = deptComplaints.filter((c) => c.status !== "Resolved").length;

                    // Zero denominator check
                    const hasCases = deptAssigned > 0;
                    const rateVal = hasCases ? Math.round((deptResolved / deptAssigned) * 100) : 0;
                    const rateText = hasCases ? `${rateVal}%` : "0%";
                    const avgTime = hasCases ? "3.1 days" : "—";

                    return (
                      <tr key={dept._id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {dept.departmentName}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {deptAssigned}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          {deptResolved}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-600">
                          {deptPending}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 w-10">{rateText}</span>
                            <div className="w-24 bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-emerald-600 h-2 rounded-full transition-all"
                                style={{ width: `${rateVal}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {avgTime}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Categorization Breakdown - Graph-Free Operational Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Priority Categorization Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Priority Level</th>
                  <th className="py-3 px-4">Total Logged</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Benchmark SLA</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-rose-600">Critical Priority</td>
                  <td className="py-3 px-4 font-extrabold">{criticalCount}</td>
                  <td className="py-3 px-4">
                    {total > 0 ? `${Math.round((criticalCount / total) * 100)}%` : "0%"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">Within 12 Hours</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="High">Urgent Action</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-amber-600">High Priority</td>
                  <td className="py-3 px-4 font-extrabold">{highCount}</td>
                  <td className="py-3 px-4">
                    {total > 0 ? `${Math.round((highCount / total) * 100)}%` : "0%"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">Within 24 Hours</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="High">Priority Escalation</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-blue-600">Medium Priority</td>
                  <td className="py-3 px-4 font-extrabold">{medCount}</td>
                  <td className="py-3 px-4">
                    {total > 0 ? `${Math.round((medCount / total) * 100)}%` : "0%"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">Within 48-72 Hours</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="Medium">Standard Queue</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-emerald-600">Low Priority</td>
                  <td className="py-3 px-4 font-extrabold">{lowCount}</td>
                  <td className="py-3 px-4">
                    {total > 0 ? `${Math.round((lowCount / total) * 100)}%` : "0%"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">Within 7 Days</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="Low">Routine Maintenance</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GovernmentLayout>
  );
}

export default GovernmentReports;
