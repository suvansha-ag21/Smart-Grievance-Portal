import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Upload,
  Sparkles,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Compass,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import CitizenLayout from "../../components/citizen/CitizenLayout";
import { Button } from "../../components/ui/Button";
import { Input, Textarea, Label } from "../../components/ui/Input";
import complaintService from "../../services/complaintService";
import departmentService from "../../services/departmentService";
import aiReviewService from "../../services/aiReviewService";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  "Roads & Infrastructure",
  "Sanitation & Waste Management",
  "Water Supply & Drainage",
  "Electricity & Power",
  "Public Health & Safety",
  "Other Civic Issue",
];

const LOCALITY_PRESETS = [
  "Main Market, Sector 14",
  "Metro Station Road, Gate 2",
  "Civil Hospital Area",
  "Central Ward Ring Road",
  "Block C Residential Colony",
];

export function RaiseComplaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, selectedLocation } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: searchParams.get("title") || "",
    description: "",
    category: searchParams.get("category") || "",
    department: searchParams.get("category") || "",
    location: selectedLocation && selectedLocation !== "Select Location" ? selectedLocation : "",
    priority: "Medium",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileMeta, setImageFileMeta] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);

  // AI suggestions
  const [aiCategory, setAiCategory] = useState(null);
  const [aiPriority, setAiPriority] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState(null);

  useEffect(() => {
    departmentService
      .getDepartments()
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch(() => {});
  }, []);

  // Run dynamic AI Categorization and Priority suggestion as citizen types
  useEffect(() => {
    const text = `${formData.title} ${formData.description}`.trim();
    if (text.length >= 6) {
      const cat = aiReviewService.suggestCategory(text);
      const prio = aiReviewService.recommendPriority(formData.title, formData.description);
      setAiCategory(cat);
      setAiPriority(prio);

      // Auto-set category if not manually chosen
      if (!formData.category && cat?.suggestedCategory) {
        setFormData((prev) => ({
          ...prev,
          category: cat.suggestedCategory,
          department: cat.suggestedCategory,
        }));
      }
    } else {
      setAiCategory(null);
      setAiPriority(null);
    }
  }, [formData.title, formData.description]);

  const applyAiCategory = (catName) => {
    setFormData((prev) => ({
      ...prev,
      category: catName,
      department: catName,
    }));
    toast.success(`Category set to "${catName}"`);
  };

  const applyAiPriority = (prioName) => {
    setFormData((prev) => ({
      ...prev,
      priority: prioName,
    }));
    toast.success(`Priority updated to "${prioName}"`);
  };

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be under 15MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFileMeta({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
      toast.success("Photo evidence loaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordsText = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)} (GPS Location)`;
        setFormData((prev) => ({
          ...prev,
          location: coordsText,
        }));
        setDetectingLoc(false);
        toast.success("GPS location coordinates detected!");
      },
      (err) => {
        setDetectingLoc(false);
        toast.error("Could not retrieve GPS location. Please type your locality landmark.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter a title for the grievance");
    if (!formData.description.trim()) return toast.error("Please provide a detailed description");
    if (!formData.location.trim()) return toast.error("Please specify the location or landmark");

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || aiCategory?.suggestedCategory || "Roads & Infrastructure",
        department: formData.department || formData.category || "Roads & Infrastructure",
        location: formData.location.trim(),
        priority: formData.priority || aiPriority?.priority || "Medium",
        image: imagePreview || "",
      };

      const result = await complaintService.submitComplaint(payload);
      toast.success("Grievance submitted and auto-routed successfully!");
      setCreatedComplaint(result);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to submit grievance";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Success Confirmation State
  if (createdComplaint) {
    const code = createdComplaint.complaintNumber || `#GRV-${createdComplaint._id?.slice(-5).toUpperCase()}`;
    return (
      <CitizenLayout>
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Complaint Registered
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1736]">
              Grievance Successfully Filed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your issue has been recorded in the civic registry, automatically categorized, and routed to the responsible department officer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-500">Tracking Reference ID:</span>
              <span className="font-black text-blue-700 text-sm">{code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Subject:</span>
              <span className="font-bold text-[#0B1736]">{createdComplaint.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Assigned Department:</span>
              <span className="font-bold text-slate-700">
                {createdComplaint.department?.departmentName || createdComplaint.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Public Priority Level:</span>
              <span className="font-bold text-slate-700">{createdComplaint.priority}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="hero" size="lg" className="flex-1">
              <Link to={`/citizen/complaints/${createdComplaint._id}`}>
                View Timeline & Details <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setCreatedComplaint(null);
                setFormData({
                  title: "",
                  description: "",
                  category: "",
                  department: "",
                  location: "",
                  priority: "Medium",
                });
                setImagePreview(null);
                setImageFileMeta(null);
              }}
              className="flex-1"
            >
              Report Another Problem
            </Button>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[#0B1736]">Report a Civic Grievance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide details, photographic evidence, and location. Our AI categorizes the problem and routes it to the designated department.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Issue Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-[#0B1736]">1. Problem Details</h2>
            </div>

            <div className="space-y-1.5">
              <Label>Grievance Title *</Label>
              <Input
                placeholder="e.g. Large crater and pothole near Sector 14 signal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Detailed Description *</Label>
              <Textarea
                rows={4}
                placeholder="Describe the severity, duration, hazards caused, or any specific landmarks nearby..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* AI Assistant Insight Pill */}
            {(aiCategory || aiPriority) && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Real-Time AI Civic Assistant</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  {aiCategory && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Suggested Department:</span>
                      <button
                        type="button"
                        onClick={() => applyAiCategory(aiCategory.suggestedCategory)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-2.5 py-1 font-bold shadow-xs hover:bg-blue-700 cursor-pointer"
                      >
                        <Tag className="h-3 w-3" />
                        <span>{aiCategory.suggestedCategory}</span>
                        <span className="text-[10px] opacity-80">({aiCategory.confidence}%)</span>
                      </button>
                    </div>
                  )}

                  {aiPriority && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Recommended Priority:</span>
                      <button
                        type="button"
                        onClick={() => applyAiPriority(aiPriority.priority)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-white shadow-xs cursor-pointer ${
                          aiPriority.priority === "Critical"
                            ? "bg-rose-600 hover:bg-rose-700 animate-pulse"
                            : aiPriority.priority === "High"
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>{aiPriority.priority}</span>
                      </button>
                      <span className="text-[11px] text-slate-500 italic">({aiPriority.reason})</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Department Category & Priority Dropdowns */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <Label>Department / Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                      department: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select civic category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Public Priority Level *</Label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Low">Low (Routine maintenance)</option>
                  <option value="Medium">Medium (Standard timeline)</option>
                  <option value="High">High (Impacting traffic / hygiene)</option>
                  <option value="Critical">Critical (Immediate safety hazard)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Photographic Evidence Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-[#0B1736]">2. Photographic Evidence</h2>
              </div>
              <span className="text-xs text-slate-400">JPG, PNG, WebP up to 15MB</span>
            </div>

            <p className="text-xs text-slate-500">
              Clear photos enable AI image inspection and help officers verify on-site conditions before dispatching repair crews.
            </p>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Uploaded evidence preview"
                    className="max-h-80 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFileMeta(null);
                    }}
                    className="absolute top-3 right-3 rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border">
                  <span className="font-semibold truncate">Attached: {imageFileMeta?.name}</span>
                  <span className="text-slate-400 shrink-0">{imageFileMeta?.size}</span>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  dragActive
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"
                }`}
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-[#0B1736]">
                  Click to browse photo or drag & drop here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  High-resolution photo of the pothole, garbage, or leak
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Section 3: Reported Location */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-[#0B1736]">3. Incident Location</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectLocation}
                disabled={detectingLoc}
                className="gap-1.5 text-xs text-blue-700"
              >
                <Compass className={`h-3.5 w-3.5 ${detectingLoc ? "animate-spin" : ""}`} />
                <span>{detectingLoc ? "Detecting GPS…" : "Use GPS Coordinates"}</span>
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Specific Address / Landmark *</Label>
                {selectedLocation && selectedLocation !== "Select Location" && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, location: selectedLocation })}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    📍 Use active area: {selectedLocation}
                  </button>
                )}
              </div>
              <Input
                placeholder="e.g. Near Pole #14, Opposite Metro Pillar 128, Sector 14"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            {/* Quick Landmark Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Locality Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {LOCALITY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, location: preset })}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <p className="text-xs text-slate-500">
              🔒 Grievances are protected by citizen privacy protocols.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/citizen/dashboard")}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={submitting}
                className="flex-1 sm:flex-initial shadow-md"
              >
                {submitting ? "Submitting & Auto-Routing…" : "Submit Complaint"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </CitizenLayout>
  );
}

export default RaiseComplaint;
