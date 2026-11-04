import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";

const links = [
  { href: "#home", label: "Home" },
  { href: "#how", label: "How It Works" },
  { href: "#portals", label: "Portals" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const { user, isCitizen, isGovernment } = useAuth();

  const dashboardPath = isGovernment ? "/government/dashboard" : isCitizen ? "/citizen/dashboard" : "/login";

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-navy md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild variant="hero">
              <Link to={dashboardPath}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="heroOutline" className="rounded-full px-6">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="hero" className="rounded-full px-6">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
