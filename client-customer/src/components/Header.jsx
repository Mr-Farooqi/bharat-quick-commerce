import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Clock,
  LogOut,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

const Header = ({ search, setSearch, onOpenLogin, onOpenOrders }) => {
  const { user, logout } = useAuth();
  const { itemCount, totalAmount, setIsOpenCart } = useCart();
  const { location, setShowLocationModal } = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand + Delivery Location */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {/* Bharat Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <img src="/logo.webp" alt="BharatBasket" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl object-contain shadow-md shadow-orange-400/20" />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 hidden md:inline">
              Bharat<span className="text-emerald-600 font-black">Basket</span>
            </span>
          </div>

          {/* Location & Speed Badge (Desktop) */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="text-left hidden lg:block hover:bg-slate-50 p-1.5 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivery in {location.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
              <span className="truncate">{location.gali ? `${location.gali}, ${location.area || location.city}` : location.title}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl relative min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder='Search "milk", "lays", "onions"...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-yellow-400 rounded-xl sm:rounded-2xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Right: Portals Links, Account & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick link to Seller & Admin portals */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
            >
              <span>Seller (:3001)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
            >
              <span>Admin (:3002)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* User Account / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  {user.name?.[0] || 'U'}
                </div>
                <span className="hidden md:inline font-extrabold">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserDropdown(false); onOpenOrders(); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => { setShowUserDropdown(false); logout(); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Login
            </button>
          )}

          {/* Big Green Cart Button */}
          <button
            onClick={() => setIsOpenCart(true)}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all transform active:scale-95 shrink-0"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              {itemCount > 0 ? (
                <>
                  <div className="text-[10px] font-semibold text-emerald-200">{itemCount} items</div>
                  <div className="text-xs font-black text-white">₹{totalAmount}</div>
                </>
              ) : (
                <span>My Cart</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Location Strip */}
      <div className="lg:hidden px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <button
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-1.5 text-slate-800 font-bold truncate max-w-full"
        >
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 font-black">{location.deliveryTime}:</span>
          <span className="text-slate-600 truncate">{location.gali ? `${location.gali}, ${location.area || location.city}` : location.title}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </div>
    </header>
  );
};

export default Header;
