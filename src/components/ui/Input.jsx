import React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-input bg-card p-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-xs font-bold uppercase tracking-wider text-navy/80", className)}
      {...props}
    />
  );
});
Label.displayName = "Label";

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

export function Card({ children, className = "", ...props }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6 shadow-card", className)} {...props}>
      {children}
    </div>
  );
}
