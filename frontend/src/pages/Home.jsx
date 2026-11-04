import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  BrainCircuit,
  ShieldCheck,
  Network,
  BarChart3,
  Users,
  Landmark,
  CheckCircle2,
  FileText,
  UserCheck,
  BadgeCheck,
  Phone,
  Mail,
  Clock,
  MapPin,
  Sparkles,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import { Button } from "../components/ui/Button";

import hero from "../assets/hero-workflow.jpg";
import citizen from "../assets/citizen.jpg";
import officer from "../assets/officer.jpg";
import skyline from "../assets/skyline.jpg";

const smartFeatures = [
  { icon: BrainCircuit, t: "AI Categorisation", d: "Automatic department mapping", c: "bg-violet-soft text-violet" },
  { icon: ShieldAlert, t: "Duplicate Detection", d: "Flags repeated reports", c: "bg-warning-soft text-warning" },
  { icon: ShieldCheck, t: "Secure Records", d: "Protected citizen identity", c: "bg-success-soft text-success" },
  { icon: BarChart3, t: "Real-Time Tracking", d: "Live status updates", c: "bg-primary-soft text-primary" },
];

const steps = [
  {
    icon: FileText,
    t: "1. Report",
    d: "Citizens submit the problem, photographic evidence, and location.",
    c: "bg-primary-soft text-primary",
  },
  {
    icon: BrainCircuit,
    t: "2. Analyze",
    d: "The system categorizes the complaint and checks for potential duplicates.",
    c: "bg-violet-soft text-violet",
  },
  {
    icon: UserCheck,
    t: "3. Review",
    d: "The appropriate government officer verifies the complaint and evidence.",
    c: "bg-success-soft text-success",
  },
  {
    icon: BadgeCheck,
    t: "4. Resolve",
    d: "The officer updates the status, records official remarks and finishes the resolution.",
    c: "bg-warning-soft text-warning",
  },
];

const faqs = [
  {
    q: "How do I submit a grievance?",
    a: "Register as a citizen, file a complaint with details and a photo, then track its status from your dashboard.",
  },
  {
    q: "How are officers assigned?",
    a: "Administrators assign each complaint to an officer of the concerned department and monitor timelines.",
  },
  {
    q: "What roles are supported?",
    a: "Citizen, officer and admin — each with its own dashboard and controls.",
  },
];

function Check({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-navy">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 fill-navy text-card" />
      <span>{children}</span>
    </li>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div className="mb-12 text-center">
      <div className="flex items-center justify-center gap-5">
        <span className="h-px w-12 bg-primary" />
        <h2 className="text-3xl font-extrabold text-navy md:text-4xl">{title}</h2>
        <span className="h-px w-12 bg-primary" />
      </div>
      {sub && <p className="mt-3 text-base text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <img
          src={hero}
          alt="Civic Redressal Portal"
          width={1920}
          height={912}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-primary shadow-card">
              <span className="h-2 w-2 rounded-full bg-primary" /> AI-Powered Civic Grievance Platform
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] text-navy md:text-6xl">
              Smarter Grievance Redressal.
              <br />
              <span className="text-primary">Better Communities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-navy/80">
              Report civic issues, track their progress, and help government departments resolve public
              problems with greater transparency and AI-assisted verification.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/citizen/raise">
                  Report a Complaint <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <Link to="/login?portal=gov">
                  <Landmark /> Government Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portals" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          title="Choose Your Portal"
          sub="Access the right portal based on your role and start making a difference."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Citizen Portal Card */}
          <div className="grid overflow-hidden rounded-3xl border bg-citizen shadow-card sm:grid-cols-[0.9fr_1.1fr]">
            <img
              src={citizen}
              alt="Citizen reporting issue"
              loading="lazy"
              width={768}
              height={896}
              className="h-64 w-full object-cover sm:h-full"
            />
            <div className="p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Users className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="text-2xl font-extrabold text-navy">Citizen Portal</h3>
                  <p className="text-sm text-muted-foreground">For Citizens</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3.5">
                <Check>Report civic issues with photos and location</Check>
                <Check>Track complaint status in real time</Check>
                <Check>View department response and resolution</Check>
                <Check>Receive notifications on every update</Check>
              </ul>
              <Button asChild variant="hero" size="xl" className="mt-8 w-full">
                <Link to="/login?portal=citizen">
                  Enter Citizen Portal <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          {/* Government Portal Card */}
          <div className="grid overflow-hidden rounded-3xl border bg-gov shadow-card sm:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0B1736] text-white shadow-sm">
                  <Landmark className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="text-2xl font-extrabold text-navy">Government Portal</h3>
                  <p className="text-sm text-muted-foreground">For Officers & Administrators</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3.5">
                <Check>Manage and resolve citizen complaints</Check>
                <Check>AI review for duplicates and evidence review</Check>
                <Check>Update status, remarks and completion dates</Check>
                <Check>View department summaries and announcements</Check>
              </ul>
              <Button asChild variant="navy" size="xl" className="mt-8 w-full">
                <Link to="/login?portal=gov">
                  Enter Government Portal <ArrowRight />
                </Link>
              </Button>
            </div>
            <img
              src={officer}
              alt="Government officer"
              loading="lazy"
              width={768}
              height={896}
              className="h-64 w-full object-cover sm:h-full"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="mx-auto max-w-7xl px-6 pb-20">
        <SectionTitle
          title="How It Works"
          sub="From complaint to resolution — a simple and transparent process."
        />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="relative text-center">
              <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${s.c}`}>
                <s.icon className="h-8 w-8" />
              </span>
              {i < 3 && (
                <ArrowRight className="absolute -right-6 top-7 hidden h-6 w-6 text-muted-foreground lg:block" />
              )}
              <h3 className="mt-5 text-lg font-bold text-navy">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 pb-20">
        <SectionTitle
          title="Smart Features"
          sub="Engineered for efficiency, transparency, and rapid civic response."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Easy Complaint Submission", d: "Structured filing with photos and precise addresses." },
            { t: "AI-Assisted Categorization", d: "Automated analysis recommending the right department." },
            { t: "Duplicate Detection", d: "Identifies existing complaints nearby to avoid duplicate work." },
            { t: "Evidence Review", d: "Assists officers by flagging reports that need manual inspection." },
            { t: "Location-Based Reporting", d: "Structured address and landmark tracking for civic problems." },
            { t: "Transparent Tracking", d: "Track status milestones from pending to resolved." },
            { t: "Department Routing", d: "Complaints flow directly to assigned officers." },
            { t: "Resolution Updates", d: "Official remarks and photographic resolution proof." },
          ].map((feat) => (
            <div key={feat.t} className="rounded-2xl border bg-card p-6 shadow-card">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold text-navy">{feat.t}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{feat.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section (matches screenshot exactly) */}
      <section id="faq" className="mx-auto max-w-7xl px-6 pb-20">
        <SectionTitle
          title="Common Questions"
          sub="Everything you need to know to get started."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-3xl border bg-card p-7 shadow-card">
              <h3 className="text-base font-extrabold text-navy">{f.q}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner (matches screenshot exactly) */}
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border bg-sky p-10 shadow-card md:p-14">
          <img
            src={skyline}
            alt=""
            loading="lazy"
            width={1536}
            height={640}
            className="absolute bottom-0 right-0 hidden h-full w-3/5 object-cover object-bottom opacity-90 md:block"
          />
          <div className="relative max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              CLEANER CITIES. HAPPIER COMMUNITIES.
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-navy md:text-5xl">
              Let's Build a Better Tomorrow
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base leading-relaxed">
              Your voice matters. Report, track and help us create cleaner, safer and more livable
              cities for everyone.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/citizen/raise">
                  Report a Complaint <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <Link to="/citizen/complaints">
                  <Search /> Track Complaint
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-3.5 text-xs font-semibold text-navy sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +91 98765 43210
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> support@egrievance-portal.com
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Mon – Fri, 9 AM – 6 PM
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Municipal Civic Redressal Center
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
