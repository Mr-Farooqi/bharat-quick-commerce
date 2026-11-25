import React from 'react';
import {
  LayoutDashboard,
  Store,
  Grid,
  Package,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shops', label: 'Shop Approvals & Stores', icon: Store, badge: 'Active' },
    { id: 'categories', label: 'Master Categories', icon: Grid },
    { id: 'products', label: 'Master Catalog', icon: Package },
    { id: 'orders', label: 'All Platform Orders', icon: ShoppingBag },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between shadow-2xl border-r border-slate-800">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-orange-500/20">
            B
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight flex items-center gap-1 text-white">
              bharat<span className="text-yellow-400 font-black">basket</span>
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Super Admin
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Platform Overview
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-yellow-400 text-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@bharatbasket.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
