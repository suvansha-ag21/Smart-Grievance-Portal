import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Citizen Portal Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import RaiseComplaint from "./pages/citizen/RaiseComplaint";
import MyComplaints from "./pages/citizen/MyComplaints";
import TrackStatus from "./pages/citizen/TrackStatus";
import ComplaintDetails from "./pages/citizen/ComplaintDetails";
import Profile from "./pages/citizen/Profile";
import GrievanceCenter from "./pages/citizen/GrievanceCenter";

// Government Portal Pages
import GovernmentDashboard from "./pages/government/GovernmentDashboard";
import AssignedComplaints from "./pages/government/AssignedComplaints";
import AIReviewCenter from "./pages/government/AIReviewCenter";
import GovernmentReports from "./pages/government/GovernmentReports";
import Announcements from "./pages/government/Announcements";
import Settings from "./pages/government/Settings";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen Portal (Protected for citizens) */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/grievance-center"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <GrievanceCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/raise"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <GrievanceCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/complaints"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <GrievanceCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/track"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <TrackStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/nearby"
            element={<Navigate to="/citizen/complaints" replace />}
          />
          <Route
            path="/citizen/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Government Portal (Protected for Officers & Admins) */}
          <Route
            path="/government/dashboard"
            element={
              <ProtectedRoute allowedRoles={["officer", "admin"]}>
                <GovernmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/complaints"
            element={
              <ProtectedRoute allowedRoles={["officer", "admin"]}>
                <AssignedComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/ai-review"
            element={
              <ProtectedRoute allowedRoles={["officer", "admin"]}>
                <AIReviewCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/map"
            element={<Navigate to="/government/complaints" replace />}
          />
          <Route
            path="/government/reports"
            element={
              <ProtectedRoute allowedRoles={["officer", "admin"]}>
                <GovernmentReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/announcements"
            element={
              <ProtectedRoute allowedRoles={["officer", "admin"]}>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government/settings"
            element={
              <ProtectedRoute allowedRoles={["officer", "admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Backward compatibility aliases */}
          <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />
          <Route path="/raise-complaint" element={<Navigate to="/citizen/raise" replace />} />
          <Route path="/my-complaints" element={<Navigate to="/citizen/complaints" replace />} />
          <Route path="/complaint/:id" element={<Navigate to="/citizen/complaints/:id" replace />} />
          <Route path="/officer" element={<Navigate to="/government/dashboard" replace />} />
          <Route path="/officer/assigned" element={<Navigate to="/government/complaints" replace />} />
          <Route path="/admin" element={<Navigate to="/government/dashboard" replace />} />
          <Route path="/admin/complaints" element={<Navigate to="/government/complaints" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
