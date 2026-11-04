import React, { useState } from "react";
import {
  MapPin,
  Compass,
  X,
  Check,
  Search,
  Building2,
  Navigation,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { toast } from "sonner";
import authService from "../../services/authService";

const POPULAR_LOCATIONS = [
  "Indiranagar, Bengaluru",
  "Andheri West, Mumbai",
  "Connaught Place, Central",
  "Banjara Hills, Hyderabad",
  "Koregaon Park, Pune",
  "T. Nagar, Chennai",
  "Salt Lake, Kolkata",
  "Sector 14, Gurugram",
  "Civil Lines, Jaipur",
  "Navrangpura, Ahmedabad",
  "Sector 62, Noida",
  "Gomti Nagar, Lucknow",
];

export default function LocationSelectorModal({ isOpen, onClose }) {
  const { user, selectedLocation, setSelectedLocation, updateUser } = useAuth();
  const [customInput, setCustomInput] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const handleSelect = async (locName) => {
    const trimmed = (locName || "").trim();
    if (!trimmed) return;

    setSelectedLocation(trimmed);

    // If citizen is logged in, optionally sync to their profile address
    if (user?.token) {
      try {
        const updated = await authService.updateProfile({ address: trimmed });
        if (updated) {
          updateUser({ address: trimmed });
        }
      } catch {
        // Local preference already saved
      }
    }

    toast.success(`Location set to: ${trimmed}`);
    onClose();
  };

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detectedLabel = `GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;

        // Optional quick reverse geocoding via OpenStreetMap Nominatim
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.county;
            const state = data.address?.state;
            if (city) {
              detectedLabel = state ? `${city}, ${state}` : city;
            }
          }
        } catch {
          // fallback to coordinates label
        }

        setDetectingGps(false);
        handleSelect(detectedLabel);
      },
      (err) => {
        setDetectingGps(false);
        toast.error("Could not retrieve GPS location. Please select or type your city.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const filteredPopular = POPULAR_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Select Your Location
              </h2>
              <p className="text-xs text-slate-500">
                Grievances and civic notices will adapt to your chosen area
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Location display */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400">Current Area</p>
              <p className="text-xs font-black text-slate-900 truncate">
                {selectedLocation || "Not Selected"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Active
          </span>
        </div>

        {/* 1. GPS Auto-Detect */}
        <Button
          type="button"
          onClick={handleGpsDetect}
          disabled={detectingGps}
          className="w-full h-11 bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200 font-bold text-xs gap-2 rounded-2xl cursor-pointer"
        >
          <Compass className={`h-4 w-4 ${detectingGps ? "animate-spin text-blue-600" : ""}`} />
          <span>{detectingGps ? "Detecting GPS location..." : "Use My Current GPS Location"}</span>
        </Button>

        {/* 2. Custom Type Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Or Type Your Locality / City / Ward:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Bandra West, Mumbai or Sector 14"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setSearchFilter(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customInput.trim()) {
                    handleSelect(customInput);
                  }
                }}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <Button
              type="button"
              disabled={!customInput.trim()}
              onClick={() => handleSelect(customInput)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
            >
              Set
            </Button>
          </div>
        </div>

        {/* 3. Popular Localities / Cities */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Suggested Localities & Cities:
          </span>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {filteredPopular.map((loc) => {
              const isSelected = selectedLocation?.toLowerCase() === loc.toLowerCase();
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/60"
                  }`}
                >
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span>{loc}</span>
                  {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
