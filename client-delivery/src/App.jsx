import React from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Login from './pages/Login';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading Delivery Partner Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main>
          <DeliveryDashboard />
        </main>
      </div>

      <footer className="py-6 border-t border-slate-900 text-center text-[11px] text-slate-600 space-y-1">
        <p className="font-extrabold text-slate-400">
          Bharat<span className="text-emerald-400">Basket</span> Delivery Partner Fleet • Real-Time POS Sync
        </p>
        <p>Connected to BharatBasket Central Hyperlocal Cloud</p>
      </footer>
    </div>
  );
}

export default App;
