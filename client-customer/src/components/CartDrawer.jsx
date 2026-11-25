import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = ({ onProceedToCheckout, onOpenLogin }) => {
  const { user } = useAuth();
  const {
    isOpenCart,
    setIsOpenCart,
    itemsList,
    activeShop,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    deliveryFee,
    totalAmount,
  } = useCart();

  if (!isOpenCart) return null;

  const handleProceed = () => {
    if (!user) {
      setIsOpenCart(false);
      onOpenLogin();
      return;
    }
    setIsOpenCart(false);
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpenCart(false)}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-sm">
                B
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">My Cart ({itemCount})</h3>
                {activeShop && (
                  <p className="text-[11px] text-slate-500 font-medium">Delivering from {activeShop.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {itemsList.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpenCart(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {itemsList.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Add fresh groceries, fruits, snacks, and milk to get them delivered in 10-15 minutes!
                </p>
                <button
                  onClick={() => setIsOpenCart(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* 10-min speed notice */}
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Delivery in 10-15 minutes guaranteed!</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100">
                  {itemsList.map((item) => (
                    <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 flex-shrink-0"
                        />
                        <div className="truncate">
                          <h5 className="font-bold text-xs text-slate-800 truncate">{item.name}</h5>
                          <p className="text-[11px] text-slate-400">{item.unit}</p>
                          <div className="text-xs font-black text-slate-900 mt-0.5">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-emerald-700 text-white rounded-xl p-1 shadow-xs flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-black text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-xs px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-black text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                    Bill Details
                  </h4>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Items Total</span>
                    <span className="font-bold text-slate-800">₹{subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Delivery Partner Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-800">₹{deliveryFee}</span>
                    )}
                  </div>

                  {subtotal < 199 && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      Add items worth ₹{199 - subtotal} more for <strong>FREE Delivery</strong>!
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="text-emerald-700 text-base">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Cancellation policy banner */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Safe & contactless delivery guaranteed with tamper-evident packaging.</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {itemsList.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-100 shadow-lg">
              <button
                onClick={handleProceed}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-between px-6 transition-all transform active:scale-98"
              >
                <div className="text-left">
                  <span className="text-[10px] font-semibold text-emerald-200 block uppercase">Total to Pay</span>
                  <span className="text-base font-black">₹{totalAmount}</span>
                </div>
                <div className="flex items-center gap-1.5 font-black">
                  <span>{user ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
