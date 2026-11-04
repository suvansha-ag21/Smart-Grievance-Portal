import React from "react";
import { cn } from "../../lib/utils";

export function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-primary-soft text-primary",
    Pending: "bg-warning-soft text-warning border-amber-200",
    Assigned: "bg-violet-soft text-violet border-purple-200",
    "In Progress": "bg-primary-soft text-primary border-blue-200",
    Resolved: "bg-success-soft text-success border-emerald-200",
    Rejected: "bg-destructive-soft text-destructive border-red-200",
    High: "bg-destructive-soft text-destructive font-semibold",
    Critical: "bg-red-600 text-white font-bold animate-pulse",
    Medium: "bg-warning-soft text-warning font-semibold",
    Low: "bg-success-soft text-success font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-xs",
        styles[variant] || styles.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
