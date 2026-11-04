import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, SearchCheck, Timer, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { Button } from "../components/ui/Button";
import { Input, Label } from "../components/ui/Input";

const STEP_NAMES = ["Basic Info", "Contact Details", "Create Password"];

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const rules = [
    { ok: formData.password.length >= 6, text: "At least 6 characters" },
    { ok: /\d/.test(formData.password), text: "At least one number" },
  ];

  const handleNext = () => {
    if (step === 0 && formData.name.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    if (step === 1) {
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (formData.phone.trim().length < 7) {
        toast.error("Please enter a valid contact number");
        return;
      }
      if (!formData.address.trim()) {
        toast.error("Please enter your locality / address");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rules.every((r) => r.ok)) {
      toast.error("Password doesn't meet requirements");
      return;
    }
    if (formData.password !== formData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agree) {
      toast.error("Please agree to terms and privacy conditions");
      return;
    }

    setBusy(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: "client",
      });

      toast.success("Account created successfully!");
      navigate("/citizen/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      subtitle="Citizen Portal"
      title="Create Your Account"
      copy="Join the civic portal and report, track, and resolve local issues together."
      features={[
        { icon: SearchCheck, t: "Report Civic Issues", d: "Upload photos and precise location" },
        { icon: Timer, t: "Track in Real Time", d: "Get transparent status updates" },
        { icon: Building2, t: "Make a Better City", d: "Collaborate with local authorities" },
      ]}
      quote="A cleaner today, a brighter tomorrow."
    >
      {/* Progress Steps */}
      <div className="mb-7 flex items-start justify-between">
        {STEP_NAMES.map((name, i) => (
          <div key={name} className="flex flex-1 flex-col items-center gap-1 text-center">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-all ${
                i < step
                  ? "bg-emerald-600 text-white"
                  : i === step
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={`text-[11px] ${
                i === step ? "font-bold text-primary" : "text-muted-foreground"
              }`}
            >
              {name}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-navy">Basic Information</h2>
              <p className="text-xs text-muted-foreground">Tell us your full name to start</p>
            </div>
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={update("name")}
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-navy">Contact Details</h2>
              <p className="text-xs text-muted-foreground">Used for complaint updates and verification</p>
            </div>
            <div className="space-y-1.5">
              <Label>Mobile Number *</Label>
              <Input
                value={formData.phone}
                onChange={update("phone")}
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={update("email")}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Complete Address / Ward *</Label>
              <Input
                value={formData.address}
                onChange={update("address")}
                placeholder="e.g. Indiranagar, Bengaluru or Bandra West, Mumbai"
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-navy">Set Password</h2>
              <p className="text-xs text-muted-foreground">Secure your account</p>
            </div>
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={update("password")}
                placeholder="Create a strong password"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={formData.confirm}
                onChange={update("confirm")}
                placeholder="Repeat password"
                required
              />
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 text-slate-600">
              <p className="font-bold text-navy">Password requirements:</p>
              {rules.map((r) => (
                <p key={r.text} className={r.ok ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                  {r.ok ? "✓" : "○"} {r.text}
                </p>
              ))}
            </div>
            <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-primary"
              />
              <span>I agree to civic terms of service and responsible reporting guidelines.</span>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-3">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              size="xl"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft /> Back
            </Button>
          )}

          {step < 2 ? (
            <Button
              type="button"
              variant="hero"
              size="xl"
              className="flex-1"
              onClick={handleNext}
            >
              Next <ArrowRight />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="flex-1"
              disabled={busy}
            >
              {busy ? "Registering…" : "Register Account"}
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}

export default Register;
