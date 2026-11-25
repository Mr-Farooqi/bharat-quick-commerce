import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import LoginModal from './pages/LoginModal';
import Home from './pages/Home';
import MyOrders from './pages/MyOrders';
import { MapPin, X, Check } from 'lucide-react';

const CustomerAppContent = () => {
  const [currentView, setCurrentView] = useState('home'); // home | orders
  const [search, setSearch] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const { showLocationModal, setShowLocationModal, presetLocations, updateLocation, location } = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-between">
      <div>
        <Header
          search={search}
          setSearch={setSearch}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenOrders={() => setCurrentView('orders')}
        />

        <main>
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
        <div className="font-extrabold text-sm text-slate-900 flex items-center justify-center gap-1">
          bharat<span className="text-emerald-600 font-black">basket</span> - 10-Minute Quick Commerce
        </div>
        <p>Built with Next-Gen Hyperlocal Architecture: Customer App (:3000) • Seller Terminal (:3001) • Admin Console (:3002) • Central API (:5000)</p>
      </footer>

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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 tracking-tight">Choose Delivery Location</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select your locality to see shops delivering in 10-15 minutes</p>

            <div className="mt-4 space-y-2">
              {presetLocations.map((loc, idx) => {
                const isSelected = location.title === loc.title;
                return (
                  <button
                    key={idx}
                    onClick={() => updateLocation(loc)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-yellow-50 border-yellow-400 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-yellow-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-black text-slate-900">{loc.title}</div>
                        <div className="text-[11px] text-slate-500">Pincode: {loc.pincode} • {loc.time}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-yellow-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
