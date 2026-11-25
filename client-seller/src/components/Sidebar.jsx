import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Store,
  LogOut,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const { logout, user, shop } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Live Orders Terminal', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory & Pricing', icon: Boxes },
    { id: 'settings', label: 'Store Profile & Hours', icon: Store },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="BharatBasket" className="w-10 h-10 rounded-xl object-contain shadow-md shadow-orange-400/20" />
            <div>
              <div className="font-extrabold text-lg tracking-tight flex items-center gap-1 text-slate-900">
                Bharat<span className="text-emerald-600 font-black">Basket</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Merchant Partner
              </div>
            </div>
          </div>
          {/* Mobile close button */}
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Shop Badge Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${shop?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <h4 className="text-xs font-black text-slate-900 truncate">
              {shop?.name || 'My Store'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Status: {shop?.isApproved ? (shop?.isOpen ? '🟢 Open for Orders' : '🔴 Store Closed') : '⏳ Awaiting Admin Approval'}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Store Ops
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Seller Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-sm flex-shrink-0">
              {user?.name?.[0] || 'M'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 min-h-screen flex-col justify-between shadow-sm shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col justify-between shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
