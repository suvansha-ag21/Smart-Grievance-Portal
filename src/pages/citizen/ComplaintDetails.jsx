import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  ExternalLink,
  ZoomIn,
  X,
  Sparkles,
  Building2,
  UserCheck,
  Image as ImageIcon,
  Check,
  Printer,
  Star,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Archive,
  Send,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import CitizenLayout from "../../components/citizen/CitizenLayout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Input";
import complaintService from "../../services/complaintService";
import { ComplaintReceiptModal } from "../../components/citizen/ComplaintReceiptModal";

export function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(null);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Citizen Satisfaction & Closure State
  const [satisfactionChoice, setSatisfactionChoice] = useState(null); // 'satisfied' | 'not_satisfied' | null
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [satisfactionComment, setSatisfactionComment] = useState("");
  const [dissatisfactionReason, setDissatisfactionReason] = useState("");
  const [isSubmittingSatisfaction, setIsSubmittingSatisfaction] = useState(false);

  // Needs More Information State
  const [moreInfoText, setMoreInfoText] = useState("");
  const [isSubmittingMoreInfo, setIsSubmittingMoreInfo] = useState(false);

  const fetchComplaint = () => {
    setLoading(true);
    complaintService
      .getComplaintById(id)
      .then((data) => setComplaint(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load complaint details")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Citizen Confirm Satisfaction (Close vs Reopen)
  const handleSatisfactionSubmit = async (satisfied) => {
    if (!complaint) return;

    if (!satisfied && !dissatisfactionReason.trim()) {
      toast.error("Please explain why you are not satisfied so the officer can rectify it.");
      return;
    }

    setIsSubmittingSatisfaction(true);
    try {
      const payload = {
        satisfied,
        feedbackRating: satisfied ? rating : 1,
        feedbackComment: satisfied ? satisfactionComment : dissatisfactionReason,
        reopenReason: !satisfied ? dissatisfactionReason.trim() : "",
      };

      const res = await complaintService.confirmSatisfaction(complaint._id, payload);

      if (satisfied) {
        toast.success("Thank you! Grievance officially marked Closed and moved to Complaint History.");
      } else {
        toast.success("Grievance reopened and returned to active department queue.");
      }

      setComplaint(res.complaint);
      setSatisfactionChoice(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process resolution confirmation.");
    } finally {
      setIsSubmittingSatisfaction(false);
    }
  };

  // Citizen Provide More Information
  const handleMoreInfoSubmit = async (e) => {
    e.preventDefault();
    if (!moreInfoText.trim()) {
      toast.error("Please provide the requested details.");
      return;
    }

    setIsSubmittingMoreInfo(true);
    try {
      const res = await complaintService.provideMoreInfo(complaint._id, {
        additionalDetails: moreInfoText.trim(),
      });
      toast.success("Additional information submitted! Sent to officer for manual verification.");
      setComplaint(res.complaint);
      setMoreInfoText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit additional information.");
    } finally {
      setIsSubmittingMoreInfo(false);
    }
  };

  if (loading) {
    return (
      <CitizenLayout>
        <div className="py-24 text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading complaint records & verification timeline…
          </p>
        </div>
      </CitizenLayout>
    );
  }

  if (error || !complaint) {
    return (
      <CitizenLayout>
        <div className="rounded-3xl border bg-card p-10 text-center shadow-card space-y-4 max-w-xl mx-auto my-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
          <h2 className="text-2xl font-bold text-navy">Grievance Not Found</h2>
          <p className="text-sm text-muted-foreground">
            {error || "Unable to retrieve the requested complaint record from the database."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/citizen/complaints">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to My Complaints
            </Link>
          </Button>
        </div>
      </CitizenLayout>
    );
  }

  const trackingCode =
    complaint.complaintNumber || `#GRV-${complaint._id.slice(-6).toUpperCase()}`;

  const deptName =
    typeof complaint.department === "object"
      ? complaint.department?.departmentName
      : complaint.department || "Municipal Grievance Cell";

  const officerName =
    typeof complaint.assignedOfficer === "object"
      ? complaint.assignedOfficer?.name
      : complaint.assignedOfficer;

  const isResolvedAwaitingFeedback =
    (complaint.status === "Resolved" || complaint.status === "RESOLVED_AWAITING_FEEDBACK") &&
    !complaint.isClosed;

  const isClosed = complaint.isClosed || complaint.status === "Closed";
  const isReopened = complaint.status === "Reopened";
  const isNeedsInfo = complaint.status === "Needs More Information";
  const isRejected = complaint.status === "Rejected";

  const aiVal = complaint.aiValidation || {};
  const classificationConf = aiVal.classificationConfidence || complaint.authenticityScore || 85;

  return (
    <CitizenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb & Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-navy">
              <Link to="/citizen/complaints">
                <ArrowLeft className="h-4 w-4" /> Back to Complaints
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-bold text-primary">{trackingCode}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Official Receipt Slip Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReceiptOpen(true)}
              className="gap-1.5 font-bold text-xs bg-white text-navy border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-primary" />
              <span>Official Receipt / Print Slip</span>
            </Button>

            <Badge variant={complaint.priority}>{complaint.priority} Priority</Badge>
            <Badge variant={complaint.status}>{complaint.status}</Badge>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BANNER 1: OFFICIAL CLOSED ARCHIVE NOTICE (IF CLOSED)      */}
        {/* ========================================================= */}
        {isClosed && (
          <div className="p-5 rounded-3xl bg-emerald-50/90 border border-emerald-300 shadow-sm text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-emerald-900 text-base">
                    Grievance Officially Closed &amp; Archived
                  </h3>
                  <span className="rounded-full bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    Permanent Record
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Citizen confirmed satisfaction on{" "}
                  <strong>
                    {complaint.closedAt
                      ? new Date(complaint.closedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Audit Record"}
                  </strong>
                  . Preserved in official Municipal Grievance History.
                </p>
                {complaint.citizenSatisfaction?.feedbackComment && (
                  <p className="text-xs text-emerald-900 bg-white/70 p-2.5 rounded-xl border border-emerald-200 italic mt-1">
                    &ldquo;{complaint.citizenSatisfaction.feedbackComment}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {complaint.citizenSatisfaction?.feedbackRating && (
              <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 bg-white/80 p-3 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= complaint.citizenSatisfaction.feedbackRating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold text-slate-700">
                  {complaint.citizenSatisfaction.feedbackRating} / 5 Satisfaction Rating
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BANNER 2: CITIZEN SATISFACTION CONFIRMATION PROMPT        */}
        {/* ========================================================= */}
        {isResolvedAwaitingFeedback && (
          <div className="p-6 rounded-3xl bg-blue-50 border-2 border-blue-300 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-xs">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-blue-950 text-base sm:text-lg">
                    Action Required: Please Confirm Your Satisfaction
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed mt-0.5">
                    The assigned municipal officer has reported this grievance as resolved. Inspect the resolution evidence below and confirm whether the work meets your satisfaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Resolution summary */}
            {complaint.resolutionDetails?.remarks && (
              <div className="bg-white/90 p-3.5 rounded-2xl border border-blue-200 text-xs text-slate-800">
                <span className="font-bold text-blue-900 block mb-1">Officer Resolution Note:</span>
                <p className="leading-relaxed">&ldquo;{complaint.resolutionDetails.remarks}&rdquo;</p>
              </div>
            )}

            {/* Decision Buttons */}
            {satisfactionChoice === null ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setSatisfactionChoice("satisfied")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-xs gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Satisfied — Close Complaint</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSatisfactionChoice("not_satisfied")}
                  className="bg-white hover:bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-xs h-10 px-5 rounded-xl shadow-xs gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Not Satisfied — Reopen Complaint</span>
                </Button>
              </div>
            ) : satisfactionChoice === "satisfied" ? (
              /* Satisfied Form: Rating + Comment -> Close */
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Step 2: Confirm Resolution Satisfaction &amp; Close Complaint
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSatisfactionChoice(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Change choice
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Rate the repair quality (1 to 5 Stars):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const active = (hoverRating || rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg transition hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              active ? "text-amber-500 fill-amber-500" : "text-slate-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-navy">
                      {rating === 5
                        ? "5 Stars (Excellent)"
                        : rating === 4
                        ? "4 Stars (Good)"
                        : rating === 3
                        ? "3 Stars (Average)"
                        : rating === 2
                        ? "2 Stars (Substandard)"
                        : "1 Star (Poor)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Citizen Feedback (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={satisfactionComment}
                    onChange={(e) => setSatisfactionComment(e.target.value)}
                    placeholder="Share brief comments on the redressal quality and timeliness..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Closing moves this grievance to your permanent Complaint History.
                  </span>
                  <Button
                    type="button"
                    disabled={isSubmittingSatisfaction}
                    onClick={() => handleSatisfactionSubmit(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 h-9 rounded-xl shadow-xs"
                  >
                    {isSubmittingSatisfaction ? "Closing Complaint…" : "Confirm & Close Complaint"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Not Satisfied Form: Dissatisfaction Reason -> Reopen */
              <div className="bg-white p-5 rounded-2xl border border-rose-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                    Step 2: Explain Issue to Reopen Grievance
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSatisfactionChoice(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Change choice
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Why was the resolution unsatisfactory? *
                  </label>
                  <textarea
                    rows={3}
                    value={dissatisfactionReason}
                    onChange={(e) => setDissatisfactionReason(e.target.value)}
                    placeholder="e.g. The leak was only temporarily patched and water is still seeping through, or the pothole filling was washed away..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    This will immediately alert the department supervisor and return the complaint to the active queue.
                  </span>
                  <Button
                    type="button"
                    disabled={isSubmittingSatisfaction || !dissatisfactionReason.trim()}
                    onClick={() => handleSatisfactionSubmit(false)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 h-9 rounded-xl shadow-xs"
                  >
                    {isSubmittingSatisfaction ? "Reopening…" : "Reopen Grievance for Inspection"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BANNER 3: ACTION REQUIRED — NEEDS MORE INFORMATION        */}
        {/* ========================================================= */}
        {isNeedsInfo && (
          <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-600 text-white shadow-xs">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-amber-950 text-base">
                  Action Required: Additional Information Needed
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  The municipal department requires clarification to dispatch an on-site team.
                </p>
                {complaint.moreInfoRequested?.reason && (
                  <p className="text-xs font-bold text-amber-950 bg-white/80 p-3 rounded-xl border border-amber-200 mt-2">
                    Officer Note: &ldquo;{complaint.moreInfoRequested.reason}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleMoreInfoSubmit} className="space-y-3 bg-white p-4 rounded-2xl border border-amber-200">
              <label className="text-xs font-bold text-slate-700 block">
                Provide Clarification / Exact Landmark Details:
              </label>
              <textarea
                rows={3}
                value={moreInfoText}
                onChange={(e) => setMoreInfoText(e.target.value)}
                placeholder="Specify nearest house number, street intersection, or clearer details regarding the issue..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingMoreInfo || !moreInfoText.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmittingMoreInfo ? "Submitting…" : "Send Information to Officer"}</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* BANNER 4: REOPENED NOTICE (IF REOPENED)                   */}
        {/* ========================================================= */}
        {isReopened && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-sm text-amber-950">
                Grievance Re-Opened for Department Re-Investigation
              </p>
              <p className="text-amber-800 leading-relaxed">
                <strong>Citizen Reason:</strong> &ldquo;{complaint.reopenReason}&rdquo;
              </p>
              <p className="text-amber-700 text-[11px]">
                Returned to {deptName} active queue for rectifying on-site defects.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BANNER 5: REJECTED NOTICE (IF REJECTED)                   */}
        {/* ========================================================= */}
        {isRejected && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3 shadow-2xs">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-sm text-rose-950">
                Grievance Rejected by Municipal Authority
              </p>
              <p className="text-rose-800 leading-relaxed">
                <strong>Official Reason:</strong> &ldquo;{complaint.rejectionReason || "Complaint does not qualify as an actionable civic defect or violates submission policies."}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN DETAILS GRID                                         */}
        {/* ========================================================= */}
        <div className="grid gap-8 lg:grid-cols-[1.9fr_1.1fr]">
          {/* Main Details Panel */}
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-card space-y-6">
              {/* Grievance Header */}
              <div className="space-y-2 border-b pb-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-extrabold text-primary text-sm">{trackingCode}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {complaint.category || "General"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy leading-snug">
                  {complaint.title}
                </h1>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Issue Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {complaint.description}
                </p>
              </div>

              {/* Location Card */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reported Location
                </h3>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-bold text-navy">{complaint.location}</p>
                </div>
              </div>

              {/* BEFORE & AFTER RESOLUTION PROOF */}
              {(complaint.resolutionImage || complaint.resolutionDetails?.resolutionImage || isResolvedAwaitingFeedback || isClosed) && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Before &amp; After Photographic Redressal Proof</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Official municipal audit comparison between initial citizen evidence and completed repairs.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Before Photo */}
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          Before Redressal (Citizen Evidence)
                        </span>
                      </div>
                      {complaint.image ? (
                        <div className="group relative rounded-xl overflow-hidden border bg-slate-900 h-48 flex items-center justify-center">
                          <img
                            src={complaint.image}
                            alt="Before repair evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveModalImage(complaint.image)}
                            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-navy/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md hover:bg-navy transition"
                          >
                            <ZoomIn className="h-3 w-3" /> Zoom
                          </button>
                        </div>
                      ) : (
                        <div className="h-48 rounded-xl border border-dashed flex items-center justify-center text-xs text-slate-400 bg-white">
                          No initial photo attached
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Reported: {new Date(complaint.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {/* After Photo */}
                    <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                          After Redressal (Official Proof)
                        </span>
                      </div>
                      {complaint.resolutionImage || complaint.resolutionDetails?.resolutionImage ? (
                        <div className="group relative rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 h-48 flex items-center justify-center">
                          <img
                            src={complaint.resolutionImage || complaint.resolutionDetails?.resolutionImage}
                            alt="Official resolution proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveModalImage(complaint.resolutionImage || complaint.resolutionDetails?.resolutionImage)}
                            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-navy/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md hover:bg-navy transition"
                          >
                            <ZoomIn className="h-3 w-3" /> Zoom
                          </button>
                        </div>
                      ) : (
                        <div className="h-48 rounded-xl border border-dashed border-emerald-300 flex flex-col items-center justify-center text-xs text-emerald-700 bg-white p-4 text-center">
                          <Clock className="h-6 w-6 text-emerald-500 mb-1" />
                          <span>Field completion logged. Site closure evidence verified by engineering staff.</span>
                        </div>
                      )}
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Field closure verified by {deptName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Original Photographic Evidence */}
              {!complaint.resolutionImage && !complaint.resolutionDetails?.resolutionImage && !isResolvedAwaitingFeedback && !isClosed && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-primary" /> Original Evidence Photo
                    </h3>
                  </div>

                  {complaint.image ? (
                    <div className="group relative rounded-2xl overflow-hidden border bg-slate-900 shadow-sm max-h-[420px] flex items-center justify-center">
                      <img
                        src={complaint.image}
                        alt="Grievance evidence capture"
                        className="w-full max-h-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveModalImage(complaint.image)}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-navy/80 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-navy transition"
                      >
                        <ZoomIn className="h-3.5 w-3.5" /> Full Photo Preview
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground bg-slate-50">
                      No photographic evidence was attached to this complaint.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official Municipal Remarks */}
            <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex items-center gap-2.5 text-navy font-bold text-base">
                <Shield className="h-5 w-5 text-primary" />
                <span>Official Municipal Status &amp; Remarks</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Remarks from {deptName}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {complaint.remarks || complaint.resolutionDetails?.remarks ? (
                    complaint.remarks || complaint.resolutionDetails?.remarks
                  ) : isClosed ? (
                    "Grievance officially closed following citizen satisfaction confirmation."
                  ) : complaint.status === "Resolved" ? (
                    "Grievance marked as resolved by municipal authority. Awaiting citizen confirmation."
                  ) : complaint.status === "In Progress" ? (
                    "Field officer deployed. On-site work and repairs are currently in active progress."
                  ) : (
                    "Grievance is currently queued for field inspection by authorized department personnel."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resolution Progress Timeline */}
            <div className="rounded-3xl border bg-card p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-base font-extrabold text-navy">Audit Timeline</h3>
                <span className="text-xs font-bold text-primary">Live Tracking</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {(complaint.timeline && complaint.timeline.length > 0
                  ? complaint.timeline
                  : [
                      {
                        title: "Complaint Filed",
                        timestamp: complaint.createdAt,
                        description: "Citizen logged issue into civic registry.",
                        completed: true,
                      },
                    ]
                ).map((step, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-[27px] grid h-6 w-6 place-items-center rounded-full text-xs font-bold ring-4 ring-white ${
                        step.completed
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-primary text-white shadow-xs"
                      }`}
                    >
                      {step.completed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-navy">{step.title}</p>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {step.timestamp ? new Date(step.timestamp).toLocaleDateString("en-IN") : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Automated Review Diagnostics */}
            <div className="rounded-3xl border bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-navy font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI Complaint Validation</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    aiVal.isValidCivic === false || classificationConf < 60
                      ? "text-rose-700 bg-rose-50 border-rose-200"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  {aiVal.isValidCivic === false ? "Needs Review" : "Validation Passed"}
                </span>
              </div>

              {/* Classification Confidence */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Classification Confidence</span>
                  <span className="font-black text-slate-800">{classificationConf}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${classificationConf}%` }}
                  />
                </div>
              </div>

              {/* Validation Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-muted-foreground font-medium">Detected Category</span>
                  <span className="font-bold text-slate-800">{aiVal.detectedCategory || complaint.category}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-muted-foreground font-medium">Recommended Dept.</span>
                  <span className="font-bold text-primary">{aiVal.recommendedDepartment || deptName}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-muted-foreground font-medium">Image Relevance</span>
                  <span className="font-bold text-slate-800">{aiVal.imageRelevance || "Relevant Evidence"}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-muted-foreground font-medium">Duplicate Risk</span>
                  <span className="font-bold text-emerald-700">
                    {aiVal.duplicateProbability ? `${aiVal.duplicateProbability}% Match Risk` : "Distinct Grievance (0%)"}
                  </span>
                </div>

                {aiVal.warnings && aiVal.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-900 block">AI Warnings:</span>
                    {aiVal.warnings.map((w, idx) => (
                      <p key={idx} className="text-[11px] text-amber-800">• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Authority */}
            <div className="rounded-3xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="text-base font-extrabold text-navy">Assigned Authority</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block font-medium">Department</span>
                    <span className="font-bold text-navy text-sm">{deptName}</span>
                  </div>
                </div>

                {officerName && (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block font-medium">Designated Officer</span>
                      <span className="font-bold text-navy text-sm">{officerName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Image Zoom Modal */}
        {activeModalImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-navy/90 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-white/20 hover:bg-white/40 p-2 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="overflow-auto max-h-[82vh] w-full flex items-center justify-center">
                <img
                  src={activeModalImage}
                  alt="Full-resolution evidence"
                  className="max-h-[80vh] w-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Official Grievance Receipt Modal */}
        <ComplaintReceiptModal
          complaint={complaint}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      </div>
    </CitizenLayout>
  );
}

export default ComplaintDetails;
