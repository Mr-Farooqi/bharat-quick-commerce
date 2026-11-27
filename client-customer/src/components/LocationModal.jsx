import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Navigation,
  Check,
  X,
  AlertCircle,
  Building,
  Home,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Edit3
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
  const [detectedPreview, setDetectedPreview] = useState(null);

  // Manual Form States
  const [gali, setGali] = useState('');
  const [area, setArea] = useState('');
  const [gaon, setGaon] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110001');
  const [landmark, setLandmark] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  if (!isOpen) return null;

  const handleAutoGps = async () => {
    const res = await detectCurrentLocation();
    if (res) {
      setDetectedPreview(res);
    }
  };

  const handleConfirmDetected = () => {
    if (onClose) onClose();
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmittingManual(true);
    try {
      await setManualLocation({
        gali,
        area: area || gali,
        gaon,
        city,
        pincode,
        landmark,
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
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Exact Delivery Address
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Gali, Area, Gaon & City identification for 10-min sub-2km dispatch
            </p>
          </div>
        </div>

        {/* Tabs: Automatic GPS vs Manual Input */}
        <div className="mt-4 flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'auto'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatic GPS Detection</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Enter Manually (Gali/Gaon)</span>
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
                  <h4 className="text-xs font-black text-slate-900">GPS Hyperlocal Reverse Geocoder</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Uses high-precision device satellites to extract exact road/gali, neighborhood, village/gaon, and district data.
                  </p>
                </div>
              </div>

              {gpsError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{gpsError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAutoGps}
                disabled={detectingGps}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {detectingGps ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Detecting Exact Street & Gali Details...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    <span>Detect My Exact Current Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Granular Breakdown Card (Showing Gali, Area, Gaon, City, Pincode) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Exact Resolved Location Data
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">🛣️ Gali / Road / Street</span>
                  <span className="font-extrabold text-slate-900 block truncate mt-0.5">
                    {location.gali || location.title}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">🏘️ Area / Mohalla / Colony</span>
                  <span className="font-extrabold text-slate-900 block truncate mt-0.5">
                    {location.area || location.city}
                  </span>
                </div>

                {location.gaon && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">🌾 Gaon / Village / Town</span>
                    <span className="font-extrabold text-slate-900 block truncate mt-0.5">
                      {location.gaon}
                    </span>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">🏙️ City / District</span>
                  <span className="font-extrabold text-slate-900 block truncate mt-0.5">
                    {location.city} {location.district && location.district !== location.city ? `(${location.district})` : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">📮 Pincode & State</span>
                  <span className="font-extrabold text-slate-900 block truncate mt-0.5">
                    {location.pincode} &bull; {location.state || 'Delhi'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600">
                <span className="font-bold text-slate-400 uppercase text-[9px] block">Full Address Delivery String:</span>
                <p className="font-semibold text-slate-800 mt-0.5 leading-snug">{location.fullAddress}</p>
              </div>

              {detectedPreview && (
                <button
                  type="button"
                  onClick={handleConfirmDetected}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Confirm This Exact Location & Verify 2km Stores</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: MANUAL ADDRESS ENTRY (GRANULAR GALI, AREA, GAON, CITY, PINCODE) */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="mt-4 space-y-3 text-xs">
            
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                🛣️ Gali No. / Road / Street / House No. *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gali No. 4, House 12-B, Main Market Road"
                value={gali}
                onChange={(e) => setGali(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  🏘️ Area / Mohalla / Colony *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laxmi Nagar / Sector 15"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  🌾 Gaon (Village) / Town (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rampur Gaon / Mandawali"
                  value={gaon}
                  onChange={(e) => setGaon(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  🏙️ City / District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi / Meerut / Noida"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  📮 Pincode *
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
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                🚩 Landmark / Nearest Spot (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Shiv Mandir / Metro Gate 2"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submittingManual}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {submittingManual ? (
                <span>Locating Exact Coordinates on Map...</span>
              ) : (
                <>
                  <span>Save Exact Location & Check 2km Dark Stores</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Presets / Known Zones */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
            Or Choose A Verified Dark Store Delivery Locality:
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                      <div className="font-extrabold text-slate-900 truncate">
                        {loc.gali ? `${loc.gali}, ` : ''}{loc.area || loc.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {loc.city} &bull; {loc.pincode} &bull; <span className="text-emerald-600 font-bold">{loc.note}</span>
                      </div>
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
