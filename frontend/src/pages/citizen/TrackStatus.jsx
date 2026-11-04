import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Compass,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  UserCheck,
  Check,
  ChevronRight,
  X,
  Eye,
  Printer,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import CitizenLayout from "../../components/citizen/CitizenLayout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Input";
import complaintService from "../../services/complaintService";
import { ComplaintReceiptModal } from "../../components/citizen/ComplaintReceiptModal";

export function TrackStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [photoModal, setPhotoModal] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const data = await complaintService.getMyComplaints();
        if (Array.isArray(data)) {
          setComplaints(data);

          // Check if an ID was passed in query string or default to first complaint
          const qId = searchParams.get("id");
          if (qId) {
            const found = data.find(
              (c) =>
                c._id === qId ||
                c.complaintNumber?.toLowerCase() === qId.toLowerCase()
            );
            if (found) {
              setSelectedComplaint(found);
              setTrackingInput(found.complaintNumber || `#GRV-${found._id.slice(-5).toUpperCase()}`);
            } else if (data.length > 0) {
              setSelectedComplaint(data[0]);
            }
          } else if (data.length > 0) {
            setSelectedComplaint(data[0]);
            setTrackingInput(data[0].complaintNumber || `#GRV-${data[0]._id.slice(-5).toUpperCase()}`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [searchParams]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    const query = trackingInput.trim().toLowerCase();
    const found = complaints.find((c) => {
      const code = (c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`).toLowerCase();
      return (
        code.includes(query) ||
        c._id.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query)
      );
    });

    if (found) {
      setSelectedComplaint(found);
    } else {
      setSelectedComplaint(null);
    }
  };

  const selectGrievance = (c) => {
    setSelectedComplaint(c);
    setTrackingInput(c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`);
  };

  // Milestone timeline calculation
  const isSubmitted = Boolean(selectedComplaint);
  const isAssigned =
    selectedComplaint?.status === "Assigned" ||
    selectedComplaint?.status === "In Progress" ||
    selectedComplaint?.status === "Resolved";
  const isInProgress =
    selectedComplaint?.status === "In Progress" || selectedComplaint?.status === "Resolved";
  const isResolved = selectedComplaint?.status === "Resolved";

  const trackingCode = selectedComplaint
    ? selectedComplaint.complaintNumber || `#GRV-${selectedComplaint._id.slice(-5).toUpperCase()}`
    : "";

  return (
    <CitizenLayout>
      <div className="space-y-6 w-full min-w-0">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-100 text-purple-700">
              <Compass className="h-4 w-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Live Grievance Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time milestone progress, department routing, field officer inspections, and resolution evidence for your complaints.
          </p>
        </div>

        {/* 1. TRACKING SEARCH BAR */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter Grievance Tracking ID (e.g. #GRV-A21C3)..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 h-11 rounded-xl shadow-xs cursor-pointer gap-2 shrink-0"
            >
              <Compass className="h-4 w-4" />
              <span>Track Grievance</span>
            </Button>
          </form>

          {/* Quick Select Chips from Citizen's Reported Complaints */}
          {complaints.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Select from your complaints:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {complaints.map((c) => {
                  const code = c.complaintNumber || `#GRV-${c._id.slice(-5).toUpperCase()}`;
                  const isSelected = selectedComplaint?._id === c._id;

                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => selectGrievance(c)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isSelected
                          ? "bg-blue-50 text-blue-800 border-blue-300 shadow-2xs font-extrabold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{code}</span>
                      <span className="text-slate-400 font-normal truncate max-w-[120px]">
                        {c.title}
                      </span>
                      <Badge variant={c.status} className="text-[10px] px-1.5 py-0.2">
                        {c.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. ACTIVE TRACKING RESULT & VISUAL STEPPER */}
        {selectedComplaint ? (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
            {/* Left: 4-Stage Live Milestone Stepper (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Grievance Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-blue-700">{trackingCode}</span>
                    <Badge variant={selectedComplaint.status}>{selectedComplaint.status}</Badge>
                    <Badge variant={selectedComplaint.priority}>
                      {selectedComplaint.priority} Priority
                    </Badge>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedComplaint.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      <span>{selectedComplaint.location}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(selectedComplaint.createdAt).toLocaleDateString("en-IN")}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReceiptOpen(true)}
                    className="rounded-xl font-bold text-xs gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 cursor-pointer shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5 text-blue-700" />
                    <span>Official Receipt</span>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs">
                    <Link to={`/citizen/complaints/${selectedComplaint._id}`}>
                      <span>Full Details</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Re-opened Grievance Notice */}
              {selectedComplaint.reopenedAt && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-950 block">
                      Grievance Re-Opened for Investigation
                    </span>
                    <span className="text-amber-800">
                      Reason: &ldquo;{selectedComplaint.reopenReason}&rdquo; (Re-opened on {new Date(selectedComplaint.reopenedAt).toLocaleDateString("en-IN")})
                    </span>
                  </div>
                </div>
              )}

              {/* 4-Stage Milestone Stepper */}
              <div className="space-y-6 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Resolution Milestone Timeline
                </h3>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Grievance Submitted */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-6 mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">
                          Stage 1: Grievance Submitted
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Completed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Citizen complaint registered in Central Municipal Database with GPS coordinates and photographic evidence.
                      </p>
                      {selectedComplaint.image && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setPhotoModal(selectedComplaint.image)}
                            className="inline-flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer text-[11px] font-bold text-blue-700"
                          >
                            <img
                              src={selectedComplaint.image}
                              alt="Complaint Evidence"
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <span>View Submitted Evidence ↗</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: AI Categorization & Dept Routing */}
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 mt-0.5 grid h-5 w-5 place-items-center rounded-full text-white shadow-xs ${
                        isAssigned ? "bg-emerald-600" : "bg-blue-600"
                      }`}
                    >
                      {isAssigned ? <Check className="h-3 w-3 stroke-[3]" /> : <Sparkles className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">
                          Stage 2: AI Verification & Department Routing
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            isAssigned
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-blue-700 bg-blue-50 border-blue-200"
                          }`}
                        >
                          {isAssigned ? "Routed" : "In Progress"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Categorized under{" "}
                        <strong className="text-slate-900">
                          {selectedComplaint.category || "Municipal Redressal"}
                        </strong>
                        . Auto-assigned to{" "}
                        <strong className="text-blue-700">
                          {selectedComplaint.department?.departmentName || "Civic Services Department"}
                        </strong>
                        . Duplicate & spam prevention verification passed.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Officer Assigned & Field Investigation */}
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 mt-0.5 grid h-5 w-5 place-items-center rounded-full text-white shadow-xs ${
                        isResolved
                          ? "bg-emerald-600"
                          : isInProgress
                          ? "bg-blue-600"
                          : "bg-slate-300"
                      }`}
                    >
                      {isResolved ? (
                        <Check className="h-3 w-3 stroke-[3]" />
                      ) : (
                        <Building2 className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">
                          Stage 3: Field Inspection & Officer Assignment
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            isResolved
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : isInProgress
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-slate-500 bg-slate-100 border-slate-200"
                          }`}
                        >
                          {isResolved
                            ? "Inspected"
                            : isInProgress
                            ? "Active Inspection"
                            : "Queued"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isInProgress
                          ? "Municipal field team is conducting on-site inspection and remedial civic action."
                          : "Awaiting field officer dispatch schedule."}
                      </p>
                      {selectedComplaint.remarks && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Official Officer Remarks:
                          </span>
                          <p className="text-slate-800 font-medium">{selectedComplaint.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Resolution & Verification */}
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 mt-0.5 grid h-5 w-5 place-items-center rounded-full text-white shadow-xs ${
                        isResolved ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      {isResolved ? (
                        <Check className="h-3 w-3 stroke-[3]" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">
                          Stage 4: Resolution & Closure
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            isResolved
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-slate-500 bg-slate-100 border-slate-200"
                          }`}
                        >
                          {isResolved ? "Resolved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isResolved
                          ? "Grievance has been fully resolved on-site and closed with official photo verification."
                          : "Resolution pending on-site repair and photographic closure documentation."}
                      </p>
                      {selectedComplaint.resolutionImage && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setPhotoModal(selectedComplaint.resolutionImage)}
                            className="inline-flex items-center gap-2 p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer text-[11px] font-bold text-emerald-800"
                          >
                            <img
                              src={selectedComplaint.resolutionImage}
                              alt="Official Resolution Evidence"
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <span>View Resolution Photo ↗</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Department Details & SLA (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Department Jurisdiction Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <Building2 className="h-4 w-4 text-blue-700" />
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Department Jurisdiction
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Responsible Department
                    </span>
                    <p className="font-black text-slate-900 mt-0.5">
                      {selectedComplaint.department?.departmentName || "Municipal Redressal"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Civic Problem Category
                    </span>
                    <p className="font-bold text-blue-700 mt-0.5">
                      {selectedComplaint.category || "General"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Assigned Ward Officer
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedComplaint.assignedOfficer?.name || "Inspector Vikram Malhotra"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Resolution SLA Benchmark
                    </span>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      Within 48 hours SLA Commitment
                    </p>
                  </div>
                </div>
              </div>

              {/* Citizen Hotline Card */}
              <div className="bg-blue-50/70 rounded-3xl border border-blue-100 p-6 shadow-xs space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-blue-700" />
                  <h4 className="font-extrabold text-blue-950">Need Urgent Escalation?</h4>
                </div>
                <p className="text-blue-700 leading-relaxed text-[11px]">
                  If this issue poses an immediate life-safety hazard, call the Central Municipal Helpline directly.
                </p>
                <div className="pt-1">
                  <a
                    href="tel:1800112233"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white font-black text-xs hover:bg-blue-800 transition"
                  >
                    <span>Call 1800-11-2233</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Search Result / No Complaints State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Compass className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {trackingInput ? "No Grievance Found" : "No Grievance Selected"}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {trackingInput
                  ? `Could not find any complaint matching "${trackingInput}". Please check the Tracking ID or select from your reported grievances.`
                  : "Enter a valid Tracking ID above to view the live milestone resolution stepper."}
              </p>
            </div>
            <div className="pt-2">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
                <Link to="/citizen/raise">
                  Report New Grievance →
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Lightbox Modal for Photo Inspection */}
        {photoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-slate-900 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPhotoModal(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-white/20 hover:bg-white/40 p-2 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="overflow-auto max-h-[82vh] w-full flex items-center justify-center">
                <img
                  src={photoModal}
                  alt="Evidence"
                  className="max-h-[80vh] w-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Official Receipt Slip */}
        <ComplaintReceiptModal
          complaint={selectedComplaint}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      </div>
    </CitizenLayout>
  );
}

export default TrackStatus;
