import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Navigation,
  Search,
  Check,
  X,
  AlertCircle,
  Building,
  Home,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const LocationModal = ({ isOpen, onClose }) => {
  const {
    location,
    presetLocations,
    updateLocation,
    detectCurrentLocation,
    setManualLocation,
    detectingGps,
    gpsError
  } = useLocation();

  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'manual'

  // Manual Form States
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110001');
  const [submittingManual, setSubmittingManual] = useState(false);

  if (!isOpen) return null;

  const handleAutoGps = async () => {
    const res = await detectCurrentLocation();
    if (res && onClose) {
      onClose();
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmittingManual(true);
    try {
      await setManualLocation({
        street,
        area: area || street,
        city,
        pincode,
      });
      if (onClose) onClose();
    } catch (err) {
      console.error('Manual location submit failed:', err);
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Select Delivery Location
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              10-Minute delivery verified within strict 2 km radius of active dark stores
            </p>
          </div>
        </div>

        {/* Tabs: Automatic GPS vs Manual Input */}
        <div className="mt-4 flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'auto'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatic GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>Enter Manually</span>
          </button>
        </div>

        {/* TAB 1: AUTOMATIC CURRENT LOCATION */}
        {activeTab === 'auto' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 via-teal-50 to-white border border-emerald-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  <Navigation className={`w-5 h-5 ${detectingGps ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Device GPS Auto-Detection</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Instantly finds your real-world coordinates and checks if a verified BharatBasket dark store is within 2 km of your doorstep.
                  </p>
                </div>
              </div>

              {gpsError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{gpsError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAutoGps}
                disabled={detectingGps}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {detectingGps ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Detecting Your GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    <span>Detect My Current Location Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Active Location Pill */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Active Address</span>
                <span className="font-extrabold text-slate-800 truncate block">{location.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL ADDRESS ENTRY */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                House / Flat / Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Block B, Green Avenue"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Area / Locality / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 110001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submittingManual}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {submittingManual ? (
                <span>Verifying Location Coordinates...</span>
              ) : (
                <>
                  <span>Save Location & Check 2km Stores</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Presets / Known Zones */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
            Or Choose A Delivery Locality:
          </p>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {presetLocations.map((loc, idx) => {
              const isSelected = location.title === loc.title;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateLocation(loc)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <div className="font-extrabold text-slate-900 truncate">{loc.title}</div>
                      <div className="text-[10px] text-slate-400">{loc.pincode} &bull; {loc.note || loc.time}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LocationModal;
