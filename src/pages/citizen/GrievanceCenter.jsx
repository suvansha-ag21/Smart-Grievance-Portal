import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Upload,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  Send,
  Save,
  LocateFixed,
  Sparkles,
  X,
  FileText,
  ChevronDown,
  Building2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import CitizenLayout from "../../components/citizen/CitizenLayout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Input";
import complaintService from "../../services/complaintService";
import { useAuth } from "../../context/AuthContext";
import skylineImg from "../../assets/skyline.jpg";

const CATEGORIES = [
  "Select civic category",
  "Roads & Infrastructure",
  "Sanitation & Waste Management",
  "Water Supply & Drainage",
  "Electricity & Power",
  "Public Health & Safety",
  "Other Civic Issue",
];

export function GrievanceCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, selectedLocation } = useAuth();

  // Active view tab on mobile/small screens (both visible on lg)
  const [activeTab, setActiveTab] = useState("all"); // "report" | "complaints" | "all"

  // Form State
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "Select civic category");
  const [priority, setPriority] = useState("Medium");
  const [location, setLocation] = useState(
    selectedLocation && selectedLocation !== "Select Location"
      ? selectedLocation
      : ""
  );
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Complaints List State (100% Live Database Driven)
  const [complaints, setComplaints] = useState([]);
  const [historyMode, setHistoryMode] = useState("active"); // "active" | "history"
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");

  const fetchComplaints = async (isHistory = historyMode === "history") => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints({ history: isHistory ? "true" : "false" });
      if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        setComplaints([]);
      }
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(historyMode === "history");
  }, [historyMode]);

  // Handle Photo Upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      toast.success("Photographic evidence attached.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        toast.success("Photo attached via drag & drop.");
      };
      reader.readAsDataURL(file);
    }
  };

  // GPS Location fetcher
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      toast.info("Detecting current GPS coordinates…");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locString = `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
          setLocation(locString);
          toast.success("Location tagged via GPS.");
        },
        () => {
          toast.error("Unable to access GPS location. Please enter your location manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  // Save as Draft
  const handleSaveDraft = () => {
    if (!title && !description) {
      toast.error("Please enter a title or description before saving draft.");
      return;
    }
    localStorage.setItem(
      "grievance_draft",
      JSON.stringify({ title, description, category, priority, location })
    );
    toast.success("Draft saved successfully to local device.");
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a grievance title.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide a detailed description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDept = category !== "Select civic category" ? category : "Roads & Infrastructure";
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: selectedDept,
        department: selectedDept,
        priority: priority || "Medium",
        location: location || "Phagwara, Punjab",
        image: imagePreview || "",
      };

      const res = await complaintService.submitComplaint(payload);
      toast.success("Grievance submitted and auto-routed to municipal department!");

      // Prepend newly created complaint to state
      const createdItem = {
        ...res,
        complaintNumber: res.complaintNumber || `SG${Math.floor(10000000 + Math.random() * 90000000)}`,
        createdAt: res.createdAt || new Date().toISOString(),
      };
      setComplaints((prev) => [createdItem, ...prev]);

      // Clear Form
      setTitle("");
      setDescription("");
      setImagePreview(null);
      localStorage.removeItem("grievance_draft");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit grievance");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered & Sorted Complaints for Right Panel
  const filteredComplaints = complaints
    .filter((c) => {
      const query = searchQuery.toLowerCase();
      const code = (c.complaintNumber || c._id || "").toLowerCase();
      const matchSearch =
        c.title?.toLowerCase().includes(query) ||
        c.location?.toLowerCase().includes(query) ||
        code.includes(query);

      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  return (
    <CitizenLayout>
      <div className="space-y-6 w-full min-w-0">
        {/* ========================================================= */}
        {/* TOP HEADER CARD WITH WATERCOLOR INDIAN SKYLINE HERO       */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {/* Watercolor Indian Civic Skyline Graphic (Anchored Right) */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 max-w-lg pointer-events-none overflow-hidden hidden sm:flex items-center justify-end">
            <img
              src={skylineImg}
              alt="Indian Civic Skyline"
              className="h-full w-auto object-cover object-right opacity-85"
            />
            {/* Soft left-fade gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent" />
          </div>

          {/* Header Text Content */}
          <div className="relative z-10 space-y-4 max-w-xl">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Grievance Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Report a civic issue and track the status of your complaints, all in one place.
              </p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab("report")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === "report" || activeTab === "all"
                    ? "border-blue-600 text-blue-600 bg-blue-50/30 font-black shadow-2xs"
                    : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                }`}
              >
                Report Issue
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("complaints")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === "complaints"
                    ? "border-blue-600 text-blue-600 bg-blue-50/30 font-black shadow-2xs"
                    : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                }`}
              >
                My Complaints ({complaints.length})
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TWO-COLUMN SIDE-BY-SIDE PANELS (Report Issue + My Complaints) */}
        {/* ========================================================= */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-start">
          {/* ======================================================= */}
          {/* LEFT COLUMN: REPORT A CIVIC ISSUE FORM                  */}
          {/* ======================================================= */}
          <div
            className={`bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 ${
              activeTab === "complaints" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Panel Title */}
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Report a Civic Issue
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide details, photographic evidence, and location. Our system will automatically categorize the problem and route it to the right department.
              </p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Grievance Title */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  Grievance Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Large pothole near Sector 14 signal"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>

              {/* 2. Detailed Description */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue, its impact, and any landmarks nearby..."
                    className="w-full p-3.5 pb-6 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
                    required
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] font-bold text-slate-400">
                    {description.length}/500
                  </span>
                </div>
              </div>

              {/* 3. Category & Priority Level (Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Department / Category */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 block text-xs">
                    Department / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Level */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 block text-xs">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  >
                    <option value="Low">🚩 Low (Standard timeline)</option>
                    <option value="Medium">🚩 Medium (Standard timeline)</option>
                    <option value="High">🚩 High (Urgent action)</option>
                    <option value="Critical">🚩 Critical (Emergency hazard)</option>
                  </select>
                </div>
              </div>

              {/* 4. Photographic Evidence (Drag & Drop Zone) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                    <span>Photographic Evidence</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    JPG, PNG, WEBP up to 15MB (Max 5 images)
                  </span>
                </div>

                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-blue-200 bg-slate-900 h-40 flex items-center justify-center group">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                      dragActive
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Drag and drop images here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      or click to browse files
                    </p>
                    <label className="mt-3 inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition cursor-pointer">
                        Choose Images
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* 5. Location Details */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  Location Details <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter address or landmark (e.g. Near City Park, Phagwara)"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0 border border-slate-200"
                  >
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span>Use my location</span>
                  </button>
                </div>
              </div>

              {/* Form Bottom Actions */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="rounded-xl font-bold text-xs gap-1.5 h-10 border-slate-300"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save as Draft</span>
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-black text-xs px-6 h-10 rounded-xl shadow-md shadow-blue-700/20 gap-2 cursor-pointer transition hover:scale-[1.01]"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Submitting…" : "Submit Grievance"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: MY COMPLAINTS LIST                        */}
          {/* ======================================================= */}
          <div
            className={`bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 ${
              activeTab === "report" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Panel Title & Queue Switcher */}
            <div className="border-b border-slate-100 pb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    My Complaints ({complaints.length})
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Track the status of your reported issues in real time.
                  </p>
                </div>

                {/* Queue Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setHistoryMode("active")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      historyMode === "active"
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryMode("history")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      historyMode === "history"
                        ? "bg-white text-emerald-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Closed History
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by complaint ID, title, or location..."
                  className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending / Awaiting</option>
                  <option value="In Progress">In Progress</option>
                  <option value="RESOLVED_AWAITING_FEEDBACK">Needs Feedback</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Complaints Cards Stack */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  Loading complaints…
                </div>
              ) : complaints.length === 0 ? (
                <div className="py-14 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/70 p-6">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-xs text-slate-800">
                    {historyMode === "history" ? "No closed complaints in archive" : "No active complaints reported yet"}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {historyMode === "history"
                      ? "Complaints you mark as Satisfied will be permanently stored here."
                      : "Submit your first civic grievance using the form on the left. It will be verified by AI and routed immediately."}
                  </p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="py-14 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6">
                  <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-xs text-slate-800">No matching complaints found</p>
                  <p className="text-[11px] text-slate-500">Try adjusting your search query or status filter.</p>
                </div>
              ) : (
                filteredComplaints.map((c) => {
                  const trackingId =
                    c.complaintNumber || `#SG${c._id.slice(-6).toUpperCase()}`;
                  const deptDisplay = typeof c.department === "object" ? c.department?.departmentName : c.department || c.category;

                  return (
                    <div
                      key={c._id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs transition flex items-center justify-between gap-3 text-xs"
                    >
                      {/* Left: Thumbnail Image */}
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt="Evidence"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
                      </div>

                      {/* Middle: ID, Title, Department, Location */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-blue-700 block">
                            {trackingId.startsWith("#") ? trackingId : `#${trackingId}`}
                          </span>
                          {deptDisplay && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[140px]">
                              {deptDisplay}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {c.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.location}</span>
                        </p>
                      </div>

                      {/* Right: Status Badge, Date, and View Details */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {c.isClosed || c.status === "Closed" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
                            Closed ✓
                          </span>
                        ) : c.status === "RESOLVED_AWAITING_FEEDBACK" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-amber-50 text-amber-900 border-amber-300 animate-pulse">
                            Feedback Needed
                          </span>
                        ) : c.status === "Resolved" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Resolved
                          </span>
                        ) : c.status === "In Progress" || c.status === "Accepted and Assigned" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-blue-50 text-blue-700 border-blue-200">
                            In Progress
                          </span>
                        ) : c.status === "Under Manual Review" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-orange-50 text-orange-700 border-orange-200">
                            Manual Review
                          </span>
                        ) : c.status === "Needs More Information" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-amber-50 text-amber-700 border-amber-200">
                            Info Needed
                          </span>
                        ) : c.status === "Rejected" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-rose-50 text-rose-700 border-rose-200">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-slate-100 text-slate-700 border-slate-200">
                            {c.status}
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>

                        <Link
                          to={`/citizen/complaints/${c._id}`}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                        >
                          <span>View Details</span>
                          <ChevronDown className="h-3 w-3 -rotate-90" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}

export default GrievanceCenter;
