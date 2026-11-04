import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "./Logo";
import hero from "../assets/hero-india-gate.jpg";

export function AuthShell({ subtitle, title, copy, features = [], quote, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={hero}
        alt="Civic portal"
        width={1920}
        height={912}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Logo subtitle={subtitle} />
          <h1 className="mt-10 text-5xl font-extrabold leading-tight text-navy">{title}</h1>
          <p className="mt-4 max-w-md text-lg text-navy/80">{copy}</p>
          <div className="mt-10 space-y-6">
            {features.map((f) => (
              <div key={f.t} className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-card text-primary shadow-card">
                  <f.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold text-navy">{f.t}</p>
                  <p className="text-sm text-navy/70">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
          {quote && (
            <p className="mt-12 border-l-4 border-primary pl-4 text-base font-semibold italic text-navy/90">
              “{quote}”
            </p>
          )}
        </div>
        <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-8 shadow-card">
          <div className="mb-5 flex items-center justify-between border-b pb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
