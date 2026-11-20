import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  Plus,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const { user, addAddress } = useAuth();
  const { cartItems, itemsList, activeShop, totalAmount, clearCart } = useCart();
  const { location } = useLocation();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or ONLINE
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const addresses = user?.addresses || [
    {
      label: 'Home',
      fullAddress: location.title,
      city: 'Delhi',
      pincode: location.pincode,
    }
  ];

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    try {
      await addAddress({
        label: newLabel,
        fullAddress: newAddress,
        city: 'Delhi',
        pincode: '110001',
      });
      setShowAddAddress(false);
      setNewAddress('');
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!activeShop?._id) return;
    setError('');
    setSubmitting(true);

    try {
      const chosenAddr = addresses[selectedAddressIndex] || {
        label: 'Home',
        fullAddress: location.title,
        city: 'Delhi',
        pincode: location.pincode,
      };

      const payload = {
        shopId: activeShop._id,
        items: itemsList.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          label: chosenAddr.label,
          fullAddress: chosenAddr.fullAddress,
          city: chosenAddr.city || 'Delhi',
          pincode: chosenAddr.pincode || '110001',
          contactPhone: user?.phone || '9876543210',
        },
        paymentMethod: paymentMethod,
      };

      const res = await api.post('/customer/orders', payload);

      if (res.data.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        clearCart();
        onClose();
        onOrderPlaced(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-slate-900 tracking-tight">Checkout & Instant Delivery</h3>
        <p className="text-xs text-slate-500 mt-0.5">Delivered to your door in 10-15 minutes</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-5 text-xs">
          {/* Section 1: Delivery Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Select Delivery Address
              </span>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{showAddAddress ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {showAddAddress ? (
              <form onSubmit={handleSaveNewAddress} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mb-2">
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                        newLabel === lbl ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter house no, floor, landmark, street address..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800"
                >
                  Save Address
                </button>
              </form>
            ) : null}

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {addresses.map((addr, idx) => {
                const isSelected = selectedAddressIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                        <span>{addr.label || 'Saved Location'}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                        {addr.fullAddress}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-2">
              Payment Method
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-700 mb-2" />
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs">Cash on Delivery</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay at doorstep via cash or UPI</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'ONLINE'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs">UPI / Online Pay</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Instant simulated payment</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items Total ({itemsList.length})</span>
              <span className="font-bold text-slate-800">₹{totalAmount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated Delivery</span>
              <span className="font-bold text-emerald-700">10-15 Minutes</span>
            </div>
          </div>
        </div>

        {/* Place Order CTA */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Place Order • ₹{totalAmount}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
