import React from 'react';
import { Power, ExternalLink, Wifi } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title, subtitle }) => {
  const { shop, refreshShop } = useAuth();

  const handleToggleStoreOpen = async () => {
    if (!shop?._id) return;
    try {
      await api.put('/seller/shop', { isOpen: !shop.isOpen });
      refreshShop();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update store status');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Instant Open / Close Store Toggle */}
        <button
          onClick={handleToggleStoreOpen}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
            shop?.isOpen
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{shop?.isOpen ? 'STORE IS ONLINE (RECEIVING ORDERS)' : 'STORE CLOSED'}</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Port links */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100 transition-colors"
          >
            <span>Customer App (:3000)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Socket.io Live</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
