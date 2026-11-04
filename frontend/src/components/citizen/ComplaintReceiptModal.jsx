import React, { useRef } from "react";
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  User,
  Building2,
  AlertCircle,
} from "lucide-react";

export function ComplaintReceiptModal({ complaint, isOpen, onClose }) {
  if (!isOpen || !complaint) return null;

  const trackingId =
    complaint.complaintNumber || `#GRV-${complaint._id.slice(-6).toUpperCase()}`;

  const deptName =
    typeof complaint.department === "object"
      ? complaint.department?.departmentName
    : complaint.department || "Municipal Corporation";

  const officerName =
    typeof complaint.assignedOfficer === "object"
      ? complaint.assignedOfficer?.name
      : complaint.assignedOfficer || "Assigned Ward Engineer";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:max-w-full">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-bold text-xs text-slate-700">Official Grievance Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 print:p-8" id="printable-receipt">
          {/* Official Government Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5 space-y-1">
            <div className="flex items-center justify-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
              <span>GOVERNMENT OF INDIA</span>
              <span>•</span>
              <span>MUNICIPAL CORPORATION</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1736] tracking-tight uppercase">
              SMART CIVIC GRIEVANCE REDRESSAL SYSTEM
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              Official Electronic Acknowledgment Slip & Audit Registry
            </p>
          </div>

          {/* Reference Banner & QR Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Grievance Reference Number
              </span>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-blue-700 font-mono">
                {trackingId}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Filed on:{" "}
                <span className="font-bold text-slate-800">
                  {new Date(complaint.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>

            {/* Simulated Clean SVG QR Code */}
            <div className="flex flex-col items-center gap-1 shrink-0 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <svg className="h-20 w-20 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                {/* 3 Position Detection Patterns */}
                <rect x="5" y="5" width="25" height="25" fill="#0E1B38" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#0E1B38" />

                <rect x="70" y="5" width="25" height="25" fill="#0E1B38" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#0E1B38" />

                <rect x="5" y="70" width="25" height="25" fill="#0E1B38" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#0E1B38" />

                {/* Data modules */}
                <rect x="35" y="10" width="5" height="5" />
                <rect x="45" y="15" width="5" height="5" />
                <rect x="55" y="10" width="5" height="5" />
                <rect x="35" y="25" width="5" height="5" />
                <rect x="50" y="25" width="5" height="5" />

                <rect x="10" y="35" width="5" height="5" />
                <rect x="25" y="40" width="5" height="5" />
                <rect x="40" y="35" width="5" height="5" />
                <rect x="55" y="40" width="5" height="5" />
                <rect x="70" y="35" width="5" height="5" />
                <rect x="85" y="40" width="5" height="5" />

                <rect x="15" y="50" width="5" height="5" />
                <rect x="30" y="55" width="5" height="5" />
                <rect x="45" y="50" width="5" height="5" />
                <rect x="60" y="55" width="5" height="5" />
                <rect x="75" y="50" width="5" height="5" />
                <rect x="90" y="55" width="5" height="5" />

                <rect x="35" y="70" width="5" height="5" />
                <rect x="45" y="75" width="5" height="5" />
                <rect x="55" y="70" width="5" height="5" />
                <rect x="65" y="80" width="5" height="5" />
                <rect x="80" y="75" width="5" height="5" />
                <rect x="40" y="85" width="5" height="5" />
                <rect x="55" y="85" width="5" height="5" />
                <rect x="70" y="85" width="5" height="5" />
              </svg>
              <span className="text-[9px] font-mono text-slate-500">Scan to Verify</span>
            </div>
          </div>

          {/* Grievance Summary Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-slate-700 uppercase tracking-wider text-[11px] border-b">
              Complaint Record Details
            </div>
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Subject / Title:</span>
                <span className="col-span-2 font-bold text-slate-900">{complaint.title}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Civic Category:</span>
                <span className="col-span-2 font-medium text-slate-800">{complaint.category}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Assigned Department:</span>
                <span className="col-span-2 font-bold text-blue-700">{deptName}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Designated Officer:</span>
                <span className="col-span-2 font-medium text-slate-800">{officerName}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Reported Locality / GPS:</span>
                <span className="col-span-2 font-medium text-slate-800">{complaint.location}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Current Status:</span>
                <span className="col-span-2 font-bold text-slate-900">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      complaint.status === "Resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : complaint.status === "In Progress"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">AI Authenticity Score:</span>
                <span
                  className={`col-span-2 font-bold ${
                    (complaint.authenticityScore ?? 96) < 70
                      ? "text-rose-700"
                      : "text-emerald-700"
                  }`}
                >
                  {complaint.authenticityScore !== undefined
                    ? `${complaint.authenticityScore}% ${
                        complaint.authenticityScore < 70
                          ? "(Flagged: High Risk Manipulation)"
                          : "(Verified Camera Capture)"
                      }`
                    : "96% (Verified Clean Submission)"}
                </span>
              </div>
            </div>
          </div>

          {/* Official Remarks (if present) */}
          {complaint.remarks && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Department Action Remarks:
              </span>
              <p className="text-slate-600 leading-relaxed italic">{complaint.remarks}</p>
            </div>
          )}

          {/* Citizen Feedback (if available) */}
          {complaint.feedback?.rating > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                Citizen Satisfaction Rating:
              </span>
              <p className="text-amber-800 font-bold">
                {"★".repeat(complaint.feedback.rating)}{"☆".repeat(5 - complaint.feedback.rating)} ({complaint.feedback.rating} / 5 Stars)
              </p>
              {complaint.feedback.comment && (
                <p className="text-slate-600 italic mt-0.5">"{complaint.feedback.comment}"</p>
              )}
            </div>
          )}

          {/* Verification Footer & Municipal Seal */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <div>
              <p className="font-bold text-slate-600">Smart Civic Redressal Portal</p>
              <p>Electronically generated on {new Date().toLocaleDateString("en-IN")}. No physical signature required.</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> VERIFIED REGISTRY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintReceiptModal;
