import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(role);
    if (!hasRole) {
      if (role === "citizen") return <Navigate to="/citizen/dashboard" replace />;
      if (role === "officer" || role === "admin") return <Navigate to="/government/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
