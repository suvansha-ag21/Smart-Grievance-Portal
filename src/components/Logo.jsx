import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export function Logo({ subtitle = "Clean Cities • Responsible Governance", link = "/" }) {
  return (
    <Link to={link} className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-cta">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold text-navy">Smart Grievance</span>
        <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
      </span>
    </Link>
  );
}

export default Logo;
