import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Copy,
  AlertTriangle,
  Tag,
  CheckCircle2,
  ShieldAlert,
  Search,
  ExternalLink,
  Flame,
  X,
  Eye,
  ImageIcon,
  ArrowRight,
  Check,
  Ban,
  Clock,
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
  ShieldX,
  Building2,
  FileText,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import GovernmentLayout from "../../components/government/GovernmentLayout";
import { Badge } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import complaintService from "../../services/complaintService";
import aiReviewService from "../../services/aiReviewService";

const CANONICAL_DEPARTMENTS = [
  { name: "Roads Department", label: "Roads Department (Potholes, Damaged Roads, Footpaths)" },
  { name: "Water Supply Department", label: "Water Supply (Leakage, Broken Pipes, Contamination)" },
  { name: "Sanitation Department", label: "Sanitation (Garbage, Overflowing Bins, Open Sewage)" },
  { name: "Electricity Department", label: "Electricity (Damaged Wires, Streetlights, Power Outage)" },
  { name: "Public Safety Department", label: "Public Safety (Deep Hazards, Open Manholes, Collapse)" },
  { name: "Other Civic Issue", label: "Other / Unclear (Manual Verification Queue)" },
];

const CANONICAL_CATEGORIES = [
  "Roads & Infrastructure",
  "Water Supply & Drainage",
  "Sanitation & Waste Management",
  "Electricity & Power",
  "Public Health & Safety",
  "Other Civic Issue",
];

export function AIReviewCenter() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("suspicious");

  const [analysis, setAnalysis] = useState({
    duplicateCount: 0,
    suspiciousCount: 0,
    highRiskCount: 0,
    unclearCount: 0,
    reverificationCount: 0,
    duplicatesList: [],
    flaggedList: [],
    unclearList: [],
    reverificationList: [],
  });

  const [modalImage, setModalImage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Modals for the 5 Officer Actions
  const [activeModalComplaint, setActiveModalComplaint] = useState(null);
  const [actionModalType, setActionModalType] = useState(null); // 'correct_category' | 'request_info' | 'mark_duplicate' | 'reject'

  // Modal Form Inputs
  const [selectedCategory, setSelectedCategory] = useState("Roads & Infrastructure");
  const [selectedDepartment, setSelectedDepartment] = useState("Roads Department");
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalReason, setModalReason] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getAssignedComplaints();
      if (Array.isArray(data)) {
        setComplaints(data);
        const res = aiReviewService.analyzeAllComplaints(data);
        setAnalysis(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // 1. Action: Confirm (Approve & Assign)
  const handleConfirm = async (c) => {
    setProcessingId(c._id);
    try {
      await complaintService.updateComplaintStatus(c._id, {
        aiAction: "confirm",
        remarks: "Officer verified AI classification and accepted grievance into active department queue.",
      });
      toast.success(`Complaint #${c.complaintNumber} confirmed and assigned.`);
      await fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm complaint");
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Action: Correct Category Modal Submit
  const handleCorrectCategorySubmit = async (e) => {
    e.preventDefault();
    if (!activeModalComplaint) return;
    setProcessingId(activeModalComplaint._id);
    try {
      await complaintService.updateComplaintStatus(activeModalComplaint._id, {
        aiAction: "correct_category",
        correctedCategory: selectedCategory,
        correctedDepartment: selectedDepartment,
        remarks: modalRemarks.trim() || `Officer reclassified category to ${selectedCategory}.`,
      });
      toast.success(`Category updated and re-routed to ${selectedDepartment}.`);
      closeActionModal();
      await fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Action: Request More Information Modal Submit
  const handleRequestInfoSubmit = async (e) => {
    e.preventDefault();
    if (!activeModalComplaint) return;
    if (!modalReason.trim()) {
      toast.error("Please specify what additional information is required from the citizen.");
      return;
    }
    setProcessingId(activeModalComplaint._id);
    try {
      await complaintService.updateComplaintStatus(activeModalComplaint._id, {
        aiAction: "request_info",
        infoRequestReason: modalReason.trim(),
      });
      toast.success("Information request dispatched to citizen. Status updated to 'Needs More Information'.");
      closeActionModal();
      await fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request information");
    } finally {
      setProcessingId(null);
    }
  };

  // 4. Action: Mark Possible Duplicate Modal Submit
  const handleMarkDuplicateSubmit = async (e) => {
    e.preventDefault();
    if (!activeModalComplaint) return;
    setProcessingId(activeModalComplaint._id);
    try {
      await complaintService.updateComplaintStatus(activeModalComplaint._id, {
        aiAction: "mark_duplicate",
        duplicateNote: modalRemarks.trim() || "Marked as possible duplicate by officer for unified inspection.",
      });
      toast.success("Flagged as potential duplicate. Status moved to 'Under Manual Review'.");
      closeActionModal();
      await fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark duplicate");
    } finally {
      setProcessingId(null);
    }
  };

  // 5. Action: Reject with Reason Modal Submit
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!activeModalComplaint) return;
    if (!modalReason.trim()) {
      toast.error("A clear rejection reason is mandatory.");
      return;
    }
    setProcessingId(activeModalComplaint._id);
    try {
      await complaintService.updateComplaintStatus(activeModalComplaint._id, {
        aiAction: "reject",
        rejectionReason: modalReason.trim(),
      });
      toast.success("Complaint rejected and citizen notified with official reason.");
      closeActionModal();
      await fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject complaint");
    } finally {
      setProcessingId(null);
    }
  };

  const openActionModal = (complaint, type) => {
    setActiveModalComplaint(complaint);
    setActionModalType(type);
    setSelectedCategory(complaint.category || "Roads & Infrastructure");
    setSelectedDepartment(
      typeof complaint.department === "object"
        ? complaint.department?.departmentName || "Roads Department"
        : complaint.department || "Roads Department"
    );
    setModalRemarks("");
    setModalReason("");
  };

  const closeActionModal = () => {
    setActiveModalComplaint(null);
    setActionModalType(null);
    setModalRemarks("");
    setModalReason("");
  };

  const categories = ["All", ...new Set(complaints.map((c) => c.category).filter(Boolean))];

  // Filtering
  const filterComplaint = (c) => {
    if (!c) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const num = (c.complaintNumber || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      const loc = (c.location || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      if (!num.includes(q) && !title.includes(q) && !loc.includes(q) && !desc.includes(q)) {
        return false;
      }
    }
    if (categoryFilter !== "All" && c.category !== categoryFilter) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    return true;
  };

  const filteredDuplicates = (analysis.duplicatesList || []).filter(({ complaint }) =>
    filterComplaint(complaint)
  );
  const filteredFlagged = (analysis.flaggedList || []).filter(({ complaint }) =>
    filterComplaint(complaint)
  );
  const filteredUnclear = (analysis.unclearList || []).filter((c) => filterComplaint(c));
  const filteredReverification = (analysis.reverificationList || []).filter((c) => filterComplaint(c));

  // Render the 5 Officer Action Buttons for any complaint card
  const renderOfficerActions = (c) => {
    const isProcessing = processingId === c._id;
    return (
      <div className="flex flex-wrap items-center gap-1.5 justify-end pt-2">
        {/* 1. Confirm */}
        <Button
          type="button"
          size="sm"
          disabled={isProcessing}
          onClick={() => handleConfirm(c)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] h-8 px-3 rounded-lg shadow-2xs gap-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Confirm</span>
        </Button>

        {/* 2. Correct Category */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => openActionModal(c, "correct_category")}
          className="bg-white hover:bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-[11px] h-8 px-3 rounded-lg shadow-2xs gap-1"
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Correct Category</span>
        </Button>

        {/* 3. Request More Information */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => openActionModal(c, "request_info")}
          className="bg-white hover:bg-amber-50 text-amber-800 border-amber-300 font-extrabold text-[11px] h-8 px-3 rounded-lg shadow-2xs gap-1"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Request Info</span>
        </Button>

        {/* 4. Mark Possible Duplicate */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => openActionModal(c, "mark_duplicate")}
          className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-[11px] h-8 px-3 rounded-lg shadow-2xs gap-1"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Mark Duplicate</span>
        </Button>

        {/* 5. Reject with Reason */}
        <Button
          type="button"
          size="sm"
          disabled={isProcessing || c.status === "Rejected"}
          onClick={() => openActionModal(c, "reject")}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] h-8 px-3 rounded-lg shadow-2xs gap-1"
        >
          <Ban className="h-3.5 w-3.5" />
          <span>{c.status === "Rejected" ? "Rejected" : "Reject"}</span>
        </Button>

        {/* Direct Link to details */}
        <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-[11px] text-slate-500 hover:text-navy">
          <Link to={`/government/assigned?id=${c._id}`}>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    );
  };

  // Helper to render AI Validation Card Metrics
  const renderAIMetrics = (c) => {
    const aiVal = c.aiValidation || {};
    const detectedCat = aiVal.detectedCategory || c.category || "General";
    const recommendedDept =
      aiVal.recommendedDepartment ||
      (typeof c.department === "object" ? c.department?.departmentName : c.department) ||
      "Roads Department";
    const classificationConf = aiVal.classificationConfidence ?? (c.authenticityScore ?? 85);
    const imgRelevance = aiVal.imageRelevance || c.evidenceAnalysis?.imageIntegrity || "Relevant Civic Evidence";
    const dupProb = aiVal.duplicateProbability ?? (c.aiFlag?.includes("Duplicate") ? 82 : 0);
    const recAction = aiVal.recommendedAction || "Auto-Route & Assign";

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>AI Automated Diagnostics</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
            {recAction}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Detected Category</span>
            <span className="font-extrabold text-slate-800 truncate block mt-0.5">{detectedCat}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Recommended Dept</span>
            <span className="font-extrabold text-primary truncate block mt-0.5">{recommendedDept}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Text Confidence</span>
            <span className="font-black text-emerald-700 block mt-0.5">{classificationConf}% Confident</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Duplicate Risk</span>
            <span className={`font-black block mt-0.5 ${dupProb > 40 ? "text-rose-700" : "text-slate-700"}`}>
              {dupProb}% Match Risk
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px]">
          <div>
            <span className="font-semibold text-slate-500">Image Relevance: </span>
            <span className="font-bold text-slate-800">{imgRelevance}</span>
          </div>

          {aiVal.warnings && aiVal.warnings.length > 0 && (
            <div className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ⚠️ {aiVal.warnings[0]}
            </div>
          )}
        </div>

        {aiVal.explanation && (
          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">
            &ldquo;{aiVal.explanation}&rdquo;
          </p>
        )}
      </div>
    );
  };

  return (
    <GovernmentLayout
      title="AI Review Center"
      subtitle="Detect potential duplicates, verify evidence, inspect classification confidence, and execute officer decisions."
    >
      <div className="space-y-6 w-full min-w-0">
        {/* 4 Review Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            {
              id: "suspicious",
              label: "Suspicious & Flagged Evidence",
              count: analysis.suspiciousCount,
              icon: ShieldAlert,
              alert: analysis.suspiciousCount > 0,
            },
            {
              id: "duplicates",
              label: "Potential Duplicates",
              count: analysis.duplicateCount,
              icon: Copy,
            },
            {
              id: "unclear",
              label: "Unclear / Verification Queue",
              count: analysis.unclearCount,
              icon: Tag,
            },
            {
              id: "reverification",
              label: "Citizen Re-verification",
              count: analysis.reverificationCount,
              icon: CheckCircle2,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-bold text-xs transition cursor-pointer ${
                  active
                    ? "bg-[#0B1736] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    active
                      ? "bg-blue-600 text-white"
                      : tab.alert
                      ? "bg-rose-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, or location..."
              className="h-9 w-full pl-8.5 pr-3 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
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
            className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted — Awaiting Validation">Awaiting Validation</option>
            <option value="Accepted and Assigned">Accepted and Assigned</option>
            <option value="Needs More Information">Needs More Information</option>
            <option value="Under Manual Review">Under Manual Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SUSPICIOUS & FLAGGED EVIDENCE                      */}
        {/* ========================================================= */}
        {selectedTab === "suspicious" && (
          <div className="space-y-6">
            {filteredFlagged.length === 0 ? (
              <div className="rounded-2xl border bg-white p-14 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                <p className="font-extrabold text-slate-800 text-sm">No Flagged or Suspicious Evidence</p>
                <p className="text-xs text-slate-400 mt-1">
                  All active grievance submissions have passed visual integrity checks.
                </p>
              </div>
            ) : (
              filteredFlagged.map(({ complaint: c, flags, score }) => {
                const trackingId = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
                const authScore = score ?? c.authenticityScore ?? 22;

                return (
                  <div
                    key={c._id}
                    className="rounded-3xl border border-rose-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-rose-700 text-xs">{trackingId}</span>
                        <h3 className="font-black text-slate-900 text-base">{c.title}</h3>
                        <Badge variant={c.status}>{c.status}</Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{c.location || "Recorded Location"}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                      {c.description}
                    </p>

                    {/* Image & AI Diagnostics */}
                    <div className="grid gap-4 sm:grid-cols-12 items-center">
                      <div className="sm:col-span-4">
                        {c.image ? (
                          <div
                            onClick={() => setModalImage(c.image)}
                            className="h-44 w-full rounded-2xl overflow-hidden border border-rose-200 bg-slate-900 cursor-pointer shadow-xs flex items-center justify-center group relative"
                          >
                            <img
                              src={c.image}
                              alt="Submitted Evidence"
                              className="h-full w-full object-contain group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                              <Eye className="h-4 w-4 mr-1" /> Inspect Photo
                            </div>
                          </div>
                        ) : (
                          <div className="h-44 rounded-2xl border border-dashed flex flex-col items-center justify-center text-xs text-rose-600 bg-rose-50/50 p-4 text-center">
                            <AlertTriangle className="h-6 w-6 text-rose-500 mb-1" />
                            <span>No Photographic Asset Attached</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-8">
                        {renderAIMetrics(c)}
                      </div>
                    </div>

                    {/* Officer Actions Bar */}
                    {renderOfficerActions(c)}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: POTENTIAL DUPLICATES                               */}
        {/* ========================================================= */}
        {selectedTab === "duplicates" && (
          <div className="space-y-4">
            {filteredDuplicates.length === 0 ? (
              <div className="rounded-2xl border bg-white p-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500 mb-2" />
                <p className="font-bold text-slate-800 text-sm">No Duplicate Grievances Flagged</p>
                <p className="text-slate-400 mt-1">All complaints have distinct civic signatures.</p>
              </div>
            ) : (
              filteredDuplicates.map(({ complaint: c, matchComp, score }) => (
                <div key={c._id} className="rounded-3xl border border-blue-200 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-blue-700 text-xs">
                        {c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                      <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5">
                        {score}% Duplicate Risk
                      </span>
                    </div>
                    <Badge variant={c.status}>{c.status}</Badge>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{c.description}</p>

                  {renderAIMetrics(c)}
                  {renderOfficerActions(c)}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: UNCLEAR / MANUAL VERIFICATION QUEUE                */}
        {/* ========================================================= */}
        {selectedTab === "unclear" && (
          <div className="space-y-4">
            {filteredUnclear.length === 0 ? (
              <div className="rounded-2xl border bg-white p-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500 mb-2" />
                <p className="font-bold text-slate-800 text-sm">Verification Queue Clean</p>
                <p className="text-slate-400 mt-1">No unverified or ambiguous complaints pending officer review.</p>
              </div>
            ) : (
              filteredUnclear.map((c) => (
                <div key={c._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-primary text-xs">
                        {c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                    </div>
                    <Badge variant={c.status}>{c.status}</Badge>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{c.description}</p>

                  {renderAIMetrics(c)}
                  {renderOfficerActions(c)}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RE-VERIFICATION (CITIZEN RE-OPENED)                 */}
        {/* ========================================================= */}
        {selectedTab === "reverification" && (
          <div className="space-y-4">
            {filteredReverification.length === 0 ? (
              <div className="rounded-2xl border bg-white p-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500 mb-2" />
                <p className="font-bold text-slate-800 text-sm">No Re-examinations Pending</p>
                <p className="text-slate-400 mt-1">No grievances currently flagged for citizen re-examination.</p>
              </div>
            ) : (
              filteredReverification.map((c) => (
                <div key={c._id} className="rounded-3xl border border-amber-200 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-700 text-xs">
                        {c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                      <Badge variant="High">Reopened by Citizen</Badge>
                    </div>
                    <Badge variant={c.status}>{c.status}</Badge>
                  </div>

                  {c.reopenReason && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      <strong>Citizen Reopen Reason:</strong> &ldquo;{c.reopenReason}&rdquo;
                    </div>
                  )}

                  {renderAIMetrics(c)}
                  {renderOfficerActions(c)}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: CORRECT CATEGORY & ROUTE                         */}
        {/* ========================================================= */}
        {actionModalType === "correct_category" && activeModalComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-100 text-purple-700">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-black text-navy text-base">Correct Category &amp; Re-Route</h3>
                    <p className="text-[11px] text-slate-400">
                      Complaint #{activeModalComplaint.complaintNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCorrectCategorySubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Target Category *</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      // Auto-suggest department matching category
                      if (/road/i.test(e.target.value)) setSelectedDepartment("Roads Department");
                      else if (/water/i.test(e.target.value)) setSelectedDepartment("Water Supply Department");
                      else if (/sanitation|waste/i.test(e.target.value)) setSelectedDepartment("Sanitation Department");
                      else if (/electric/i.test(e.target.value)) setSelectedDepartment("Electricity Department");
                      else if (/safety/i.test(e.target.value)) setSelectedDepartment("Public Safety Department");
                    }}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white font-medium"
                    required
                  >
                    {CANONICAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Target Department Queue *</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white font-medium"
                    required
                  >
                    {CANONICAL_DEPARTMENTS.map((d) => (
                      <option key={d.name} value={d.name}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Officer Remarks / Audit Note (Optional)</label>
                  <textarea
                    rows={2}
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                    placeholder="e.g. Content relates to drainage overflow rather than road repair. Re-routing to Sanitation division..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-50 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="ghost" size="sm" onClick={closeActionModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processingId !== null} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                    {processingId ? "Re-routing…" : "Confirm Reclassification"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: REQUEST MORE INFORMATION                         */}
        {/* ========================================================= */}
        {actionModalType === "request_info" && activeModalComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-800">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-black text-navy text-base">Request More Information</h3>
                    <p className="text-[11px] text-slate-400">
                      Citizen will receive an alert to supply details for #{activeModalComplaint.complaintNumber}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={closeActionModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRequestInfoSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Specific Information Required *</label>
                  <textarea
                    rows={4}
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="e.g. Photographic evidence is too blurry to identify location. Please upload a clear photo showing the nearest house number or street landmark..."
                    className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="ghost" size="sm" onClick={closeActionModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processingId !== null || !modalReason.trim()} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                    {processingId ? "Sending…" : "Send Request to Citizen"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: MARK POSSIBLE DUPLICATE                          */}
        {/* ========================================================= */}
        {actionModalType === "mark_duplicate" && activeModalComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-blue-700">
                    <Copy className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-black text-navy text-base">Mark as Possible Duplicate</h3>
                    <p className="text-[11px] text-slate-400">
                      Flag #{activeModalComplaint.complaintNumber} for joint review (not auto-rejected)
                    </p>
                  </div>
                </div>
                <button type="button" onClick={closeActionModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleMarkDuplicateSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Duplicate Notes / Matching Reference</label>
                  <textarea
                    rows={3}
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                    placeholder="e.g. Reports identical pothole on Main GT Road near Pillar #42. Merged for field crew verification..."
                    className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="ghost" size="sm" onClick={closeActionModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processingId !== null} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    {processingId ? "Flagging…" : "Flag for Human Review"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: REJECT WITH REASON                               */}
        {/* ========================================================= */}
        {actionModalType === "reject" && activeModalComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose-700">
                    <Ban className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-black text-navy text-base">Reject Complaint with Reason</h3>
                    <p className="text-[11px] text-slate-400">
                      Grievance #{activeModalComplaint.complaintNumber}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={closeActionModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Official Rejection Reason *</label>
                  <textarea
                    rows={4}
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="e.g. Non-civic matter / political slogan, invalid photographic evidence, or outside municipal jurisdiction..."
                    className="w-full rounded-xl border border-slate-200 p-3 bg-slate-50 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="ghost" size="sm" onClick={closeActionModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processingId !== null || !modalReason.trim()} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    {processingId ? "Rejecting…" : "Confirm Rejection"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Image Zoom Modal */}
        {modalImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-slate-900 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-white/20 hover:bg-white/40 p-2 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="overflow-auto max-h-[82vh] w-full flex items-center justify-center">
                <img
                  src={modalImage}
                  alt="High-Res Evidence"
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

export default AIReviewCenter;
