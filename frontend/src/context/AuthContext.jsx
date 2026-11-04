import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Dynamic citizen location: initialized from local storage or profile address
  const [selectedLocation, setSelectedLocationState] = useState(() => {
    try {
      const savedLoc = localStorage.getItem("citizenSelectedLocation");
      if (savedLoc && savedLoc.trim()) return savedLoc.trim();
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.address && parsed.address.trim()) return parsed.address.trim();
      }
    } catch {
      // ignore
    }
    return "Indiranagar, Bengaluru";
  });

  const setSelectedLocation = (newLoc) => {
    const loc = (newLoc || "").trim() || "Indiranagar, Bengaluru";
    setSelectedLocationState(loc);
    try {
      localStorage.setItem("citizenSelectedLocation", loc);
    } catch {
      // ignore
    }
  };

  // Keep location synchronized if user updates their profile address
  useEffect(() => {
    if (user?.address && user.address.trim()) {
      const savedLoc = localStorage.getItem("citizenSelectedLocation");
      if (!savedLoc) {
        setSelectedLocationState(user.address.trim());
      }
    }
  }, [user?.address]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await authService.register(payload);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });
  };

  const normalizedRole = user?.role === "client" ? "citizen" : user?.role || "";
  const isCitizen = normalizedRole === "citizen";
  const isGovernment = normalizedRole === "officer" || normalizedRole === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        role: normalizedRole,
        isCitizen,
        isGovernment,
        loading,
        selectedLocation,
        setSelectedLocation,
        login,
        register,
        updateUser,
        logout,
        isAuthenticated: Boolean(user?.token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
