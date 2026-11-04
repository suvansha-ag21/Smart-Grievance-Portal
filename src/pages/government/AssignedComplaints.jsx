import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle,
  Edit3,
  X,
  UserCheck,
  Shield,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  ExternalLink,
  ZoomIn,
  Camera,
  Upload,
  Clock,
  Building2,
  Trash2,
  Tag,
  Check,
  ArrowLeft,
  RefreshCw,
  ImageIcon,
  User,
  CheckCircle2,
  Copy,
  Star,
  RotateCcw,
  ShieldCheck,
  Compass,
  Droplets,
  Zap,
  ShieldAlert,
  Layers,
  ChevronRight,
  FolderOpen,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import GovernmentLayout from "../../components/government/GovernmentLayout";
import { Button } from "../../components/ui/Button";
import { Input, Badge, Textarea, Label } from "../../components/ui/Input";
import complaintService from "../../services/complaintService";
import { useAuth } from "../../context/AuthContext";

// Canonical Municipal Departments & Divisions with clean, highlight-focused executive styling
const CANONICAL_DIVISIONS = [
  {
    id: "roads",
    name: "Roads Department",
    shortName: "Roads",
    aliases: ["Roads Department", "Roads & Infrastructure", "Roads"],
    icon: Compass,
    description: "Potholes, damaged asphalt, craters, divider repairs & broken footpaths.",
    defaultOfficer: "Rajesh Sharma",
    officerEmail: "officer.roads@portal.gov",
  },
  {
    id: "water",
    name: "Water Supply Department",
    shortName: "Water Supply",
    aliases: ["Water Supply Department", "Water Supply & Drainage", "Water Supply"],
    icon: Droplets,
    description: "Water pipeline bursts, low pressure, dirty drinking water & main line leaks.",
    defaultOfficer: "Priya Verma",
    officerEmail: "officer.water@portal.gov",
  },
  {
    id: "sanitation",
    name: "Sanitation Department",
    shortName: "Sanitation",
    aliases: ["Sanitation Department", "Sanitation & Waste Management", "Sanitation", "Sanitation & Waste"],
    icon: Trash2,
    description: "Overflowing garbage dumps, uncollected waste, open sewage & bin clearing.",
    defaultOfficer: "Amit Kumar",
    officerEmail: "officer.sanitation@portal.gov",
  },
  {
    id: "electricity",
    name: "Electricity Department",
    shortName: "Electricity",
    aliases: ["Electricity Department", "Electricity & Power", "Electricity"],
    icon: Zap,
    description: "Damaged cables, live wires, streetlights, transformer sparks & outages.",
    defaultOfficer: "Sunita Rao",
    officerEmail: "officer.electricity@portal.gov",
  },
  {
    id: "safety",
    name: "Public Safety Department",
    shortName: "Public Safety",
    aliases: ["Public Safety Department", "Public Health & Safety", "Public Safety"],
    icon: ShieldAlert,
    description: "Deep open manholes, structural collapse risks, fallen trees & hazard sites.",
    defaultOfficer: "Inspector Meena Joshi",
    officerEmail: "officer.safety@portal.gov",
  },
  {
    id: "other",
    name: "Other / Unclear Verification Queue",
    shortName: "Other / Unclear",
    aliases: ["Other Civic Issue", "Other/Unclear", "General", "Drainage Department"],
    icon: Layers,
    description: "Unclassified reports, political/non-civic flagged content & ambiguous issues.",
    defaultOfficer: "Supervisor Queue",
    officerEmail: "admin@portal.gov",
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

export function AssignedComplaints() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const queryDept = searchParams.get("department");

  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewQueue, setViewQueue] = useState("active"); // "active" | "closed_history"

  // Department Selection State: null = Departments Directory view; string = Department Workspace
  const [selectedDivisionId, setSelectedDivisionId] = useState(() => {
    if (queryDept) {
      const match = CANONICAL_DIVISIONS.find(
        (d) => d.id === queryDept.toLowerCase() || d.name.toLowerCase().includes(queryDept.toLowerCase())
      );
      if (match) return match.id;
    }
    return null;
  });

  // Filters within Department view
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Selected complaint for detailed view (View A)
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | ai | history | similar

  // Update Status form state
  const [updateStatus, setUpdateStatus] = useState("In Progress");
  const [remarks, setRemarks] = useState("");
  const [resolutionImage, setResolutionImage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [photoLightbox, setPhotoLightbox] = useState(null);

  const loadData = async (queueType = viewQueue) => {
    setLoading(true);
    try {
      const data =
        queueType === "closed_history"
          ? await complaintService.getOfficerClosedHistory()
          : await complaintService.getAssignedComplaints();

      if (Array.isArray(data)) {
        setComplaints(data);

        // If URL has ?id=..., automatically select that complaint and open its department
        if (queryId) {
          const match = data.find(
            (c) =>
              c._id === queryId ||
              c.complaintNumber?.toLowerCase() === queryId.toLowerCase() ||
              `#grv-${c._id.slice(-5)}`.toLowerCase() === queryId.toLowerCase()
          );
          if (match) {
            selectComplaint(match);
            const divId = getComplaintDivisionId(match);
            setSelectedDivisionId(divId);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(viewQueue);
  }, [queryId, viewQueue]);

  const selectComplaint = (c) => {
    setActiveComplaint(c);
    setUpdateStatus(c.status || "In Progress");
    setRemarks(c.remarks || "");
    setResolutionImage(c.resolutionImage || "");
    setActiveTab("overview");
  };

  const clearSelection = () => {
    setActiveComplaint(null);
    setResolutionImage("");
    if (queryId) {
      searchParams.delete("id");
      setSearchParams(searchParams);
    }
  };

  const handleResolutionPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resolution image size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResolutionImage(reader.result);
      toast.success("Resolution proof photo attached.");
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setUpdating(true);
    try {
      const payload = {
        status: updateStatus,
        remarks: remarks.trim(),
        resolutionImage: resolutionImage || undefined,
        clearFlag: true,
      };

      if (updateStatus === "Resolved") {
        payload.aiAction = "resolve";
      } else if (updateStatus === "Rejected") {
        payload.aiAction = "reject";
        payload.rejectionReason = remarks.trim() || "Rejected by municipal department authority.";
      }

      await complaintService.updateComplaintStatus(activeComplaint._id, payload);

      toast.success(
        updateStatus === "Resolved"
          ? "Work marked resolved. Citizen prompted for satisfaction confirmation!"
          : "Complaint status and official remarks updated!"
      );
      await loadData();
      // Keep active complaint updated in state
      setActiveComplaint((prev) => ({
        ...prev,
        status: updateStatus,
        remarks: remarks.trim(),
        resolutionImage: resolutionImage || prev?.resolutionImage,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const activeDivision = CANONICAL_DIVISIONS.find((d) => d.id === selectedDivisionId);

  // Complaints belonging ONLY to the selected department
  const departmentComplaints = selectedDivisionId
    ? complaints.filter((c) => getComplaintDivisionId(c) === selectedDivisionId)
    : [];

  const filteredDepartmentComplaints = departmentComplaints.filter((c) => {
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

  // Calculate live counts per division
  const getDivisionStats = (divisionId) => {
    const divComplaints = complaints.filter((c) => getComplaintDivisionId(c) === divisionId);
    const total = divComplaints.length;
    const inProgress = divComplaints.filter((c) => ["In Progress", "Assigned", "Accepted and Assigned"].includes(c.status)).length;
    const pendingReview = divComplaints.filter((c) => ["Pending", "Submitted — Awaiting Validation", "Under Manual Review", "Needs More Information"].includes(c.status)).length;
    const resolvedOrClosed = divComplaints.filter((c) => ["Resolved", "Closed", "RESOLVED_AWAITING_FEEDBACK"].includes(c.status) || c.isClosed).length;
    return { total, inProgress, pendingReview, resolvedOrClosed };
  };

  return (
    <GovernmentLayout
      title="Government Grievance Management"
      subtitle="Department-based routing and grievance queues. Inspect evidence, AI findings, and track resolution."
    >
      <div className="space-y-6 w-full min-w-0">
        {/* ============================================================== */}
        {/* VIEW A: FULL COMPLAINT DETAIL VIEW                             */}
        {/* ============================================================== */}
        {activeComplaint ? (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearSelection();
                    if (!selectedDivisionId) setSelectedDivisionId(getComplaintDivisionId(activeComplaint));
                  }}
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>
                    Back to {activeDivision?.name || "Department Queue"}
                  </span>
                </button>
                <span>/</span>
                <span className="font-extrabold text-slate-800">
                  {activeComplaint.complaintNumber ||
                    `#GRV-${activeComplaint._id.slice(-5).toUpperCase()}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={activeComplaint.priority}>{activeComplaint.priority} Priority</Badge>
                <Badge variant={activeComplaint.status}>{activeComplaint.status}</Badge>
              </div>
            </div>

            {/* Closed Archive Banner if closed */}
            {(activeComplaint.isClosed || activeComplaint.status === "Closed") && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-sm">Complaint Officially Closed &amp; Archived in MongoDB</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Citizen confirmed satisfactory resolution on{" "}
                      {activeComplaint.closedAt
                        ? new Date(activeComplaint.closedAt).toLocaleDateString("en-IN")
                        : "Official Record"}
                      . Preserved in official archive.
                    </p>
                  </div>
                </div>

                {activeComplaint.citizenSatisfaction?.feedbackRating && (
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{activeComplaint.citizenSatisfaction.feedbackRating} / 5 Stars</span>
                  </div>
                )}
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Complaint Details & Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border bg-white p-6 shadow-2xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                        {activeComplaint.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-blue-700">
                          {activeComplaint.complaintNumber || `#GRV-${activeComplaint._id.slice(-5).toUpperCase()}`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{activeComplaint.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{new Date(activeComplaint.createdAt).toLocaleDateString("en-IN")}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Grievance Description
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {activeComplaint.description}
                    </p>
                  </div>

                  {/* Evidence Photo */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Submitted Photographic Evidence</span>
                    </h3>
                    {activeComplaint.image ? (
                      <div
                        onClick={() => setPhotoLightbox(activeComplaint.image)}
                        className="group relative rounded-2xl overflow-hidden border bg-slate-950 h-52 flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        <img
                          src={activeComplaint.image}
                          alt="Evidence"
                          className="w-full h-full object-contain group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                          <ZoomIn className="h-4 w-4 mr-1" /> Inspect Full Evidence
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 rounded-2xl border border-dashed flex items-center justify-center text-xs text-slate-400 bg-slate-50">
                        No photographic evidence attached
                      </div>
                    )}
                  </div>

                  {/* Before / After Resolution Proof if available */}
                  {(activeComplaint.resolutionImage || activeComplaint.status === "Resolved") && (
                    <div className="space-y-2 pt-2 border-t">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Field Resolution Proof Photo</span>
                      </h3>
                      {activeComplaint.resolutionImage ? (
                        <div
                          onClick={() => setPhotoLightbox(activeComplaint.resolutionImage)}
                          className="group relative rounded-2xl overflow-hidden border border-emerald-300 bg-slate-950 h-52 flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <img
                            src={activeComplaint.resolutionImage}
                            alt="Resolution"
                            className="w-full h-full object-contain group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                            <ZoomIn className="h-4 w-4 mr-1" /> Inspect Resolution Photo
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                          Work marked complete. Official closure verification image will update shortly.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Audit Timeline */}
                <div className="rounded-2xl border bg-white p-6 shadow-2xs space-y-4 text-xs">
                  <h3 className="text-sm font-extrabold text-slate-900">Audit Status History</h3>
                  <div className="space-y-3">
                    {activeComplaint.timeline && activeComplaint.timeline.length > 0 ? (
                      activeComplaint.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{event.title}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{event.description}</p>
                            <span className="text-[10px] text-slate-400">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString("en-GB") : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 py-4">Initial complaint submission recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Analysis Summary + Update Status Form */}
              <div className="lg:col-span-5 space-y-6">
                {/* AI Diagnostics Box */}
                <div className="rounded-2xl border bg-white p-5 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-sm">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span>AI Forensic Analysis</span>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Automated
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Detected Category</span>
                      <p className="font-bold text-slate-900 mt-0.5">{activeComplaint.category}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Classification Confidence</span>
                      <p className="font-black text-emerald-700 mt-0.5">
                        {activeComplaint.aiValidation?.classificationConfidence ?? (activeComplaint.authenticityScore ?? 85)}% Confident
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Image Relevance</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {activeComplaint.aiValidation?.imageRelevance || activeComplaint.evidenceAnalysis?.imageIntegrity || "Relevant Evidence"}
                      </p>
                    </div>

                    {activeComplaint.aiValidation?.warnings && activeComplaint.aiValidation.warnings.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                        <span className="font-bold block uppercase text-[10px]">AI Flag Warnings:</span>
                        {activeComplaint.aiValidation.warnings.map((w, i) => (
                          <p key={i}>• {w}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Update Status Card */}
                <div className="rounded-2xl border bg-white p-5 shadow-2xs space-y-4 text-xs">
                  <h3 className="text-sm font-extrabold text-slate-900">Update Grievance Status</h3>

                  <form onSubmit={handleUpdateComplaint} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600">New Status</Label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold focus:ring-2 focus:ring-blue-600"
                        required
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Accepted and Assigned">Accepted and Assigned</option>
                        <option value="Needs More Information">Needs More Information</option>
                        <option value="Under Manual Review">Under Manual Review</option>
                        <option value="Resolved">Resolved (Awaiting Citizen Confirmation)</option>
                        <option value="Rejected">Rejected with Reason</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600">
                        {updateStatus === "Rejected" ? "Rejection Reason *" : "Official Remarks"}
                      </Label>
                      <Textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder={
                          updateStatus === "Rejected"
                            ? "Explain why complaint is rejected (e.g. invalid photo, non-civic dispute)..."
                            : "Add official status update or action taken..."
                        }
                        className="text-xs"
                        required={updateStatus === "Rejected"}
                      />
                    </div>

                    {/* Upload Resolution Photo */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                        <span>Upload Resolution Photo (Field Proof)</span>
                        {resolutionImage && (
                          <span className="text-emerald-600 font-bold text-[10px]">Attached</span>
                        )}
                      </Label>

                      {resolutionImage ? (
                        <div className="relative rounded-xl overflow-hidden border max-h-36 bg-slate-900 flex items-center justify-center">
                          <img
                            src={resolutionImage}
                            alt="Resolution"
                            className="max-h-36 w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setResolutionImage("")}
                            className="absolute top-2 right-2 rounded-lg bg-rose-600 text-white p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleResolutionPhotoUpload}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 file:mr-2 file:py-0.5 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white"
                        />
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      {updating ? "Updating…" : "Update Complaint Status"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : selectedDivisionId && activeDivision ? (
          /* ============================================================== */
          /* VIEW B: DEPARTMENT-SPECIFIC COMPLAINTS QUEUE                   */
          /* ============================================================== */
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDivisionId(null);
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1.5 text-xs cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Departments</span>
                </button>
                <span className="text-xs text-slate-400">/</span>
                <span className="font-extrabold text-slate-800 text-xs">{activeDivision.name}</span>
              </div>

              {/* Department Switcher Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold hidden sm:inline">Switch Department:</span>
                <select
                  value={selectedDivisionId}
                  onChange={(e) => {
                    setSelectedDivisionId(e.target.value);
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700"
                >
                  {CANONICAL_DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>{d.shortName} Department</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Division Header Card */}
            <div className="rounded-2xl p-6 text-white bg-[#0E1B38] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 backdrop-blur-md text-white shadow-inner">
                  <activeDivision.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight">{activeDivision.name}</h2>
                    <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-slate-200">
                      {departmentComplaints.length} Total Complaints
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {activeDivision.description}
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal pt-0.5">
                    Authorized Officer: <strong className="text-white">{activeDivision.defaultOfficer}</strong> ({activeDivision.officerEmail})
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs">
                <span className="font-medium text-slate-300 text-[11px]">
                  {viewQueue === "active" ? "Active Queue" : "Closed Archive"}
                </span>
                <span className="text-2xl font-bold text-white">
                  {filteredDepartmentComplaints.length}
                </span>
              </div>
            </div>

            {/* Queue Switcher: Active Complaints vs Closed Archive */}
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => {
                  setViewQueue("active");
                  setStatusFilter("All");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition cursor-pointer ${
                  viewQueue === "active"
                    ? "bg-[#0E1B38] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Active Department Complaints</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewQueue("closed_history");
                  setStatusFilter("All");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs transition cursor-pointer ${
                  viewQueue === "closed_history"
                    ? "bg-[#162544] text-white border border-white/10 shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Department Closed History &amp; Archive</span>
              </button>
            </div>

            {/* Department Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeDivision.shortName} complaints by ID, title, landmark...`}
                  className="pl-11 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Accepted and Assigned">Accepted and Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Needs More Information">Needs More Information</option>
                  <option value="Under Manual Review">Under Manual Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Department Complaints Table */}
            <div className="rounded-2xl border bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 w-[130px]">Grievance ID</th>
                      <th className="py-3.5 px-4">Title &amp; Location</th>
                      <th className="py-3.5 px-4 w-[110px]">Priority</th>
                      <th className="py-3.5 px-4 w-[130px]">Status</th>
                      <th className="py-3.5 px-4 w-[100px]">Date Filed</th>
                      <th className="py-3.5 px-4 w-[110px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center text-slate-400">
                          Loading {activeDivision.name} grievances…
                        </td>
                      </tr>
                    ) : filteredDepartmentComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <FolderOpen className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                          <p className="font-bold text-slate-800 text-sm">
                            No {viewQueue === "active" ? "active" : "closed"} grievances in {activeDivision.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {search || statusFilter !== "All"
                              ? "No complaints match active filter parameters."
                              : "This department queue is completely up to date."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredDepartmentComplaints.map((c) => {
                        const trackingId = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
                        return (
                          <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {c.image ? (
                                  <img
                                    src={c.image}
                                    alt="Thumb"
                                    className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                    <ImageIcon className="h-4 w-4" />
                                  </div>
                                )}
                                <span className="font-mono font-bold text-blue-700 text-xs">
                                  {trackingId}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-[280px]">
                              <p className="font-extrabold text-slate-900 truncate">{c.title}</p>
                              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{c.location || "Location recorded"}</span>
                              </p>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <Badge variant={c.priority}>{c.priority}</Badge>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <Badge variant={c.status}>{c.status}</Badge>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                              {new Date(c.createdAt).toLocaleDateString("en-IN")}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => selectComplaint(c)}
                                className="h-7 text-xs font-bold gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                              >
                                <span>Inspect</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
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
        ) : (
          /* ============================================================== */
          /* VIEW C: DEPARTMENTS DIRECTORY (TOP-LEVEL SELECTION)            */
          /* ============================================================== */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-wider">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>Municipal Government Portals &amp; Divisions</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Government Redressal Departments
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                    Select a municipal department below to inspect its dedicated complaint queue, manage assigned work orders, and review field resolution proofs.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 bg-blue-50/70 px-3.5 py-2 rounded-2xl border border-blue-200/80 text-xs shadow-2xs">
                  <span className="font-extrabold text-blue-900 text-sm">{complaints.length}</span>
                  <span className="text-blue-700 font-medium">Total Grievances in Database</span>
                </div>
              </div>
            </div>

            {/* Department Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CANONICAL_DIVISIONS.map((division) => {
                const DivIcon = division.icon;
                const stats = getDivisionStats(division.id);
                const isUserDept =
                  user?.department &&
                  division.aliases.some((a) => a.toLowerCase().includes(String(user.department).toLowerCase()));

                return (
                  <div
                    key={division.id}
                    onClick={() => {
                      setSelectedDivisionId(division.id);
                      setSearch("");
                      setStatusFilter("All");
                    }}
                    className="rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white p-5 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group"
                  >
                    {/* Top Section */}
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 group-hover:bg-[#0E1B38] group-hover:text-white transition-colors shadow-2xs">
                          <DivIcon className="h-5 w-5" />
                        </div>

                        {isUserDept ? (
                          <span className="rounded-full bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                            Your Division
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 border border-slate-200 uppercase tracking-wider">
                            {division.shortName}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors flex items-center justify-between">
                          <span>{division.name}</span>
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                          {division.description}
                        </p>
                      </div>

                      {/* Live Counter Badges with Clean Executive Styling */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
                          <span className="text-base font-extrabold text-slate-900 block leading-none">
                            {stats.total}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
                            Total
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
                          <span className={`text-base font-extrabold ${stats.inProgress > 0 ? "text-slate-900" : "text-slate-500"} block leading-none`}>
                            {stats.inProgress}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
                            Active
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
                          <span className={`text-base font-extrabold ${stats.resolvedOrClosed > 0 ? "text-slate-900" : "text-slate-500"} block leading-none`}>
                            {stats.resolvedOrClosed}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
                            Closed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Officer & CTA Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                        Officer: <strong className="text-slate-700">{division.defaultOfficer}</strong>
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                        <span>Open Queue</span>
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Photo Zoom Modal */}
        {photoLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-slate-900 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPhotoLightbox(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-white/20 hover:bg-white/40 p-2 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="overflow-auto max-h-[82vh] w-full flex items-center justify-center">
                <img
                  src={photoLightbox}
                  alt="Evidence Lightbox"
                  className="max-h-[80vh] w-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </GovernmentLayout>
  );
}

export default AssignedComplaints;
