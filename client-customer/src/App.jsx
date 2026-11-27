import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import BottomCartBar from './components/BottomCartBar';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import LocationModal from './components/LocationModal';
import LoginModal from './pages/LoginModal';
import Home from './pages/Home';
import MyOrders from './pages/MyOrders';

const CustomerAppContent = () => {
  const [currentView, setCurrentView] = useState('home'); // home | orders
  const [search, setSearch] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const { showLocationModal, setShowLocationModal } = useLocation();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-between">
      <div>
        <Header
          search={search}
          setSearch={setSearch}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenOrders={() => setCurrentView('orders')}
        />

        <main className={itemCount > 0 ? 'pb-24 sm:pb-28' : ''}>
          {currentView === 'home' ? (
            <Home search={search} setSearch={setSearch} />
          ) : (
            <MyOrders
              onBack={() => setCurrentView('home')}
              onTrackOrder={(ord) => setTrackingOrder(ord)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="font-extrabold text-sm text-slate-900 flex items-center justify-center gap-2">
          <img src="/logo.webp" alt="BharatBasket" className="w-6 h-6 rounded-lg object-contain shadow-xs shadow-amber-400/20" />
          <span>Bharat<span className="text-emerald-600 font-black">Basket</span> - 10-Minute Quick Commerce</span>
        </div>
        <p>Built with Next-Gen Hyperlocal Architecture: Customer App (:3000) • Seller Terminal (:3001) • Admin Console (:3002) • Central API (:5000)</p>
      </footer>

      {/* Bottom Floating Cart Bar (appears at bottom center when items are added) */}
      <BottomCartBar />

      {/* Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setShowCheckoutModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onOrderPlaced={(newOrder) => setTrackingOrder(newOrder)}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      {/* Login Modal (Prompts Location on Login Success) */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLocationModal(true)}
      />

      {/* Location Selector Modal (GPS Automatic & Manual 2km verification) */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <CustomerAppContent />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
