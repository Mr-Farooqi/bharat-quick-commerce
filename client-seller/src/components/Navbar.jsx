import React from 'react';
import { Power, ExternalLink, Wifi, Menu } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title, subtitle, onOpenMobileMenu }) => {
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

  const handleToggleDeliveryMode = async () => {
    if (!shop?._id) return;
    const newMode = shop?.deliveryMode === 'self' ? 'delivery_partner' : 'self';
    try {
      await api.put('/seller/shop', { deliveryMode: newMode });
      refreshShop();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery mode');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2.5">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg md:hidden cursor-pointer hover:bg-slate-100"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight line-clamp-1">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Delivery Mode Toggle: Self Delivery vs Delivery Partner */}
        <button
          onClick={handleToggleDeliveryMode}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
            shop?.deliveryMode === 'self'
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100'
          }`}
          title="Toggle whether orders are delivered by your own staff or by BharatBasket Delivery Partners"
        >
          {shop?.deliveryMode === 'self' ? (
            <>
              <span className="text-sm">🏪</span>
              <span className="hidden sm:inline">Self Delivery</span>
              <span className="sm:hidden">Self</span>
            </>
          ) : (
            <>
              <span className="text-sm">🛵</span>
              <span className="hidden sm:inline">Delivery Fleet</span>
              <span className="sm:hidden">Fleet</span>
            </>
          )}
        </button>

        {/* Instant Open / Close Store Toggle */}
        <button
          onClick={handleToggleStoreOpen}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
            shop?.isOpen
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{shop?.isOpen ? 'STORE ONLINE' : 'STORE CLOSED'}</span>
          <span className="sm:hidden">{shop?.isOpen ? 'ONLINE' : 'CLOSED'}</span>
        </button>

        <div className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Socket.io Live</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
