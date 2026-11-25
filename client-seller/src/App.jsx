import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StoreSettings from './pages/StoreSettings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { LayoutDashboard, Boxes, Store } from 'lucide-react';

const SellerApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const titles = {
    dashboard: { title: 'Store Terminal & Live Orders', subtitle: 'Real-time order packing, status updates and incoming alerts' },
    inventory: { title: 'Store Inventory & Shelf Stock', subtitle: 'Manage prices, discounts, and instant out-of-stock switches' },
    settings: { title: 'Merchant Profile & Timings', subtitle: 'Store details and delivery zone settings' },
  };

  const currentMeta = titles[activeTab] || titles.dashboard;

  const mobileNavItems = [
    { id: 'dashboard', label: 'Live Orders', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'settings', label: 'Store Settings', icon: Store },
  ];

  return (
    <SocketProvider>
      <div className="flex min-h-screen bg-[#F8F9FA]">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'inventory' && <Inventory />}
            {activeTab === 'settings' && <StoreSettings />}
          </main>

          {/* Bottom Navigation for Mobile Phones */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                    isActive ? 'text-emerald-600 font-black' : 'text-slate-400 font-semibold'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </SocketProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SellerApp />
    </AuthProvider>
  );
}
