import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StoreSettings from './pages/StoreSettings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const SellerApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <SocketProvider>
      <div className="flex min-h-screen bg-[#F8F9FA]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar title={currentMeta.title} subtitle={currentMeta.subtitle} />
          <main className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'inventory' && <Inventory />}
            {activeTab === 'settings' && <StoreSettings />}
          </main>
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
