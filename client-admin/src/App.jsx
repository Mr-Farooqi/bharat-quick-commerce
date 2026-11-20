import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const AdminApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const titles = {
    dashboard: { title: 'Executive Overview', subtitle: 'Platform-wide telemetry, gross revenue, and operations' },
    shops: { title: 'Store Approvals & Merchant Directory', subtitle: 'Manage merchant onboarding and delivery radius' },
    categories: { title: 'Master Grocery Categories', subtitle: 'Catalog hierarchy and storefront category banners' },
    products: { title: 'Master Catalog Management', subtitle: 'Global product definitions for dark store stocking' },
    orders: { title: 'Platform Live Orders', subtitle: 'Live streaming order fulfillment across all vendors' },
  };

  const currentMeta = titles[activeTab] || titles.dashboard;

  return (
    <div className="flex min-h-screen bg-[#F4F6FB]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={currentMeta.title} subtitle={currentMeta.subtitle} />
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'shops' && <Shops />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'orders' && <Orders />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
