import React, { useState } from 'react';
import { Power, Bike, LogOut, ShieldCheck, ExternalLink, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, setUser, logout } = useAuth();
  const [toggling, setToggling] = useState(false);

  const handleToggleDuty = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await api.put('/api/delivery/duty', { isOnline: !user?.isOnline });
      if (res.data.success) {
        setUser(prev => ({ ...prev, isOnline: res.data.isOnline }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update duty status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="BharatBasket" className="w-10 h-10 rounded-xl object-contain shadow-md shadow-orange-500/20" />
          <div>
            <div className="font-extrabold text-base md:text-lg tracking-tight flex items-center gap-1 text-white">
              Bharat<span className="text-emerald-400 font-black">Basket</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Bike className="w-3 h-3" /> Delivery Partner Hub
            </div>
          </div>
        </div>

        {/* Center / Duty switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleDuty}
            disabled={toggling}
            className={`flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-black transition-all shadow-sm ${
              user?.isOnline
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20 pulse-glow'
                : 'bg-rose-950 border border-rose-700 text-rose-300 hover:bg-rose-900'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${user?.isOnline ? 'animate-spin' : ''}`} />
            <span>{user?.isOnline ? 'DUTY: ONLINE ⚡' : 'DUTY: OFFLINE 💤'}</span>
          </button>
        </div>

        {/* Right / Rider Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right text-xs">
            <p className="font-extrabold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {user?.vehicleNumber || 'Bike'} • {user?.phone}
            </p>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
