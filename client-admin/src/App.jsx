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
import { LayoutDashboard, Store, Grid, Package, ShoppingBag } from 'lucide-react';

const AdminApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const mobileNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'shops', label: 'Stores', icon: Store },
    { id: 'products', label: 'Catalog', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F6FB]">
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
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'shops' && <Shops />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'orders' && <Orders />}
        </main>

        {/* Bottom Navigation for Mobile Phones */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-yellow-400 font-black' : 'text-slate-400 font-semibold'
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
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
