import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Building2,
  Send,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import GovernmentLayout from "../../components/government/GovernmentLayout";
import { Button } from "../../components/ui/Button";
import { Input, Textarea, Label, Badge } from "../../components/ui/Input";
import announcementService from "../../services/announcementService";
import { useAuth } from "../../context/AuthContext";

export function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("active"); // active | drafts | archived
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "Roads & Infrastructure",
    priority: "Medium",
    targetWard: "All Wards",
  });

  const categories = [
    "Roads & Infrastructure",
    "Water Supply & Drainage",
    "Sanitation & Waste Management",
    "Electricity & Power",
    "Public Health & Safety",
    "General Civic Notice",
  ];

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementService.getAnnouncements();
      if (Array.isArray(data)) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Please provide both an announcement title and message.");
      return;
    }

    setSubmitting(true);
    try {
      await announcementService.createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        priority: form.priority,
        targetWard: form.targetWard,
      });

      toast.success("Civic announcement published and broadcasted to citizens!");
      setForm({
        title: "",
        message: "",
        category: "Roads & Infrastructure",
        priority: "Medium",
        targetWard: "All Wards",
      });
      setShowCreateModal(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to broadcast announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await announcementService.deleteAnnouncement(id);
      toast.success("Announcement removed successfully.");
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error("Failed to delete announcement.");
    }
  };

  return (
    <GovernmentLayout
      title="Broadcast Notices"
      subtitle="Manage public alerts and announcements visible to citizens."
    >
      <div className="space-y-6 w-full min-w-0">
        {/* Top Action Bar with Tabs & New Announcement Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: "active", label: `Active Notices (${announcements.length})` },
              { id: "drafts", label: "Drafts (1)" },
              { id: "archived", label: "Archived (8)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-[#0E1B38] text-white border-[#0E1B38] shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="gap-2 bg-[#0E1B38] hover:bg-[#162544] text-white font-medium text-xs rounded-lg shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{showCreateModal ? "Close Form" : "New Announcement"}</span>
          </Button>
        </div>

        {/* Collapsible / Expandable Create Notice Form */}
        {showCreateModal && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-98">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Broadcast New Official Notice
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Will instantly notify all registered citizens in the targeted ward
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Notice Title *</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Water Pipeline Maintenance Advisory"
                  className="h-10 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Civic Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Priority Level</Label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Low">Normal / Informational</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Target Ward / Zone</Label>
                  <Input
                    value={form.targetWard}
                    onChange={(e) => setForm({ ...form, targetWard: e.target.value })}
                    placeholder="All Wards or e.g. Sector 14"
                    className="h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Notice Description / Message *</Label>
                <Textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Provide timing, affected streets, emergency alternatives, and helpline..."
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs font-bold h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl h-10 px-6 gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "Broadcasting…" : "Broadcast Announcement"}</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Notices Cards Feed */}
        <div className="space-y-3">
          {loading ? (
            <p className="py-16 text-center text-xs text-slate-400">Loading broadcast notices…</p>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Megaphone className="h-6 w-6" />
              </div>
              <p className="text-sm font-extrabold text-slate-800">No broadcast notices yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "+ New Announcement" above to issue official notices, traffic diversions, or maintenance alerts to citizens.
              </p>
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a._id}
                className="p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition bg-white shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Notice
                      </span>
                      <Badge variant={a.priority}>{a.priority} Priority</Badge>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {a.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(a.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{a.title}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(a._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  <span>Target: {a.targetWard || "All Wards"}</span>
                  <span>Published by: {a.createdBy?.name || "Chief Officer"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GovernmentLayout>
  );
}

export default Announcements;
