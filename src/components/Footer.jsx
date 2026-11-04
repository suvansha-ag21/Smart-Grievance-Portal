import React from "react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t bg-card py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6">
        <Logo />
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#home" className="hover:text-primary">Home</a>
          <a href="#how" className="hover:text-primary">How It Works</a>
          <a href="#portals" className="hover:text-primary">Portals</a>
          <a href="#faq" className="hover:text-primary">FAQ</a>
          <a href="#contact" className="hover:text-primary">Contact</a>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Smart Grievance. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
