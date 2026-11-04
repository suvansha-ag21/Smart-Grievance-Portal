import React, { useState, useEffect, useRef } from "react";
import GovernmentLayout from "../../components/government/GovernmentLayout";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Shield,
  Bell,
  Lock,
  Edit2,
  Check,
  X,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Phone,
  MapPin,
  Sliders,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";
import authService from "../../services/authService";
import officerDefaultImg from "../../assets/officer.jpg";

export function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // profile | department | ai-sensitivity | notifications | security
  const fileInputRef = useRef(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "Vikram Malhotra",
    email: "officer@example.com",
    department: "Municipal Civic Redressal",
    role: "Chief Officer",
    phone: "9876543210",
    employeeId: "DEP001",
    address: "Central Administrative Block, New Delhi",
  });
  const [profilePhoto, setProfilePhoto] = useState(officerDefaultImg);
  const [profileSaving, setProfileSaving] = useState(false);

  // Department State
  const [deptForm, setDeptForm] = useState({
    deptName: "Municipal Public Works & Infrastructure",
    contactEmail: "civic-support@gov.in",
    helpline: "1800-11-2026",
    officeLocation: "Palika Kendra, New Delhi",
    slaTargetHours: "48",
  });

  // AI Sensitivity State
  const [aiSensitivity, setAiSensitivity] = useState({
    duplicateThreshold: 75,
    blurDetection: true,
    autoRouting: true,
    fraudVerificationStrictness: "High",
  });

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("officer_notif_prefs");
      return saved
        ? JSON.parse(saved)
        : {
            criticalAlerts: true,
            aiFlagAlerts: true,
            assignmentAlerts: true,
            weeklyDigest: false,
          };
    } catch {
      return {
        criticalAlerts: true,
        aiFlagAlerts: true,
        assignmentAlerts: true,
        weeklyDigest: false,
      };
    }
  });

  // System Preferences State
  const [preferences, setPreferences] = useState({
    language: "English (en-IN)",
    theme: "Light Mode",
    autoRefresh: "30 seconds",
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "Vikram Malhotra",
        email: user.email || "officer@example.com",
        department: user.department || "Municipal Civic Redressal",
        role: "Chief Officer",
        phone: user.phone || "9876543210",
        employeeId: "DEP001",
        address: user.address || "Central Administrative Block, New Delhi",
      });
      if (user.avatar) {
        setProfilePhoto(user.avatar);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      });
      if (updateUser) updateUser(updated);
      toast.success("Profile changes saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveDepartment = (e) => {
    e.preventDefault();
    toast.success("Department settings and SLA benchmark updated successfully!");
  };

  const handleSaveAiSensitivity = (e) => {
    e.preventDefault();
    toast.success("AI duplicate threshold and validation sensitivity updated!");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhoto(reader.result);
        toast.success("Profile photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(officerDefaultImg);
    toast.success("Profile photo reset to default.");
  };

  const handleSaveNotifPrefs = () => {
    localStorage.setItem("officer_notif_prefs", JSON.stringify(notifPrefs));
    toast.success("Notification preferences saved successfully!");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please enter both current and new passwords.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Official account password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <GovernmentLayout
      title="Settings"
      subtitle="Manage your session, preferences, and security."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full min-w-0 items-start">
        {/* Left Sub-nav Column - exactly matching Screen 7 */}
        <div className="lg:col-span-3 space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "department", label: "Department", icon: Building2 },
            { id: "ai-sensitivity", label: "AI Sensitivity", icon: Sliders },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white font-black shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Main Content Area - matching Screen 7 */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Official Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update officer credentials and designation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleSaveProfile} className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                      <Input
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Vikram Malhotra"
                        className="h-10 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Official Email</Label>
                      <Input
                        disabled
                        value={profileForm.email}
                        className="h-10 text-xs font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Department</Label>
                      <Input
                        value={profileForm.department}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, department: e.target.value })
                        }
                        placeholder="Municipal Civic Redressal"
                        className="h-10 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Official Role</Label>
                      <Input
                        disabled
                        value={profileForm.role}
                        className="h-10 text-xs font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Contact Number</Label>
                      <Input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="9876543210"
                        className="h-10 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Employee ID</Label>
                      <Input
                        disabled
                        value={profileForm.employeeId}
                        className="h-10 text-xs font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs cursor-pointer"
                    >
                      {profileSaving ? "Saving Changes…" : "Save Changes"}
                    </Button>
                  </div>
                </form>

                {/* Right Emblem & Seal Card - matching Screen 7 */}
                <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col items-center text-center space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    Official Authority Seal
                  </h4>

                  {/* Lion Capital of Ashoka Emblem Graphic */}
                  <div className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center p-3 shadow-xs">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-700">
                      <path d="M 50 10 C 40 10 35 20 35 30 C 35 45 42 55 50 65 C 58 55 65 45 65 30 C 65 20 60 10 50 10 Z" />
                      <circle cx="50" cy="72" r="6" fill="#1e3a8a" />
                      <rect x="25" y="80" width="50" height="8" rx="2" fill="#d97706" />
                      <rect x="20" y="90" width="60" height="4" rx="1" fill="#78350f" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="font-black text-xs text-slate-900">Government of India</p>
                    <p className="text-[10px] text-slate-500 font-medium">Municipal Grievance Directorate</p>
                    <span className="inline-block mt-1 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Verified Authority
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENT */}
          {activeTab === "department" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Department Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure departmental routing parameters, helpline, and benchmark SLAs
                </p>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4 max-w-2xl">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Department Name</Label>
                  <Input
                    value={deptForm.deptName}
                    onChange={(e) => setDeptForm({ ...deptForm, deptName: e.target.value })}
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Helpline Contact</Label>
                    <Input
                      value={deptForm.helpline}
                      onChange={(e) => setDeptForm({ ...deptForm, helpline: e.target.value })}
                      className="h-10 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Standard Resolution SLA (Hours)</Label>
                    <Input
                      type="number"
                      value={deptForm.slaTargetHours}
                      onChange={(e) => setDeptForm({ ...deptForm, slaTargetHours: e.target.value })}
                      className="h-10 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Official Headquarters Address</Label>
                  <Input
                    value={deptForm.officeLocation}
                    onChange={(e) => setDeptForm({ ...deptForm, officeLocation: e.target.value })}
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Department Settings
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: AI SENSITIVITY */}
          {activeTab === "ai-sensitivity" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">AI Review Sensitivity</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calibrate machine learning thresholds for duplicate image detection and automated routing
                </p>
              </div>

              <form onSubmit={handleSaveAiSensitivity} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Duplicate Matching Threshold</span>
                    <span className="text-blue-600 font-black">{aiSensitivity.duplicateThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={aiSensitivity.duplicateThreshold}
                    onChange={(e) =>
                      setAiSensitivity({
                        ...aiSensitivity,
                        duplicateThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    Complaints with visual similarity above this score will automatically be flagged for officer merge.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSensitivity.blurDetection}
                      onChange={(e) =>
                        setAiSensitivity({ ...aiSensitivity, blurDetection: e.target.checked })
                      }
                      className="h-4 w-4 rounded accent-blue-600"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Blur & Low-Resolution Filter</span>
                      <span className="block text-[11px] text-slate-400">Flag photo submissions with unidentifiable civic defects.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiSensitivity.autoRouting}
                      onChange={(e) =>
                        setAiSensitivity({ ...aiSensitivity, autoRouting: e.target.checked })
                      }
                      className="h-4 w-4 rounded accent-blue-600"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Automated Department Routing</span>
                      <span className="block text-[11px] text-slate-400">Directly route confirmed grievances to ward engineers.</span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Save AI Configuration
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Officer Alerts & Notifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure when you receive notifications on new citizen filings
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                {[
                  {
                    key: "criticalAlerts",
                    label: "Critical Priority Alerts",
                    desc: "Urgent emergency hazards like open manholes and gas leaks",
                  },
                  {
                    key: "aiFlagAlerts",
                    label: "AI Duplicate & Tamper Flags",
                    desc: "Get notified when AI flags suspicious photo submissions",
                  },
                  {
                    key: "assignmentAlerts",
                    label: "New Grievance Assignments",
                    desc: "Receive alert when complaints are auto-routed to your desk",
                  },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPrefs[item.key]}
                      onChange={(e) =>
                        setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })
                      }
                      className="h-4 w-4 mt-0.5 rounded accent-blue-600"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{item.label}</span>
                      <span className="block text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                  </label>
                ))}

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleSaveNotifPrefs}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Notification Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === "security" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">Account Security</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your official login password and security settings
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Current Password</Label>
                  <Input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">New Password</Label>
                  <Input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Confirm New Password</Label>
                  <Input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="h-10 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    {passwordSaving ? "Updating Password…" : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </GovernmentLayout>
  );
}

export default Settings;
