import React from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ item, shop }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const prod = item.product;
  const inCart = cartItems[prod._id];
  const activePrice = item.discountPrice || item.price;
  const hasDiscount = item.discountPrice && item.discountPrice < item.price;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
      <div>
        {/* Top: Delivery estimate & Image */}
        <div className="relative h-40 bg-slate-50/70 rounded-2xl p-3 flex items-center justify-center overflow-hidden mb-3">
          <span className="absolute top-2.5 left-2.5 text-[9px] font-black uppercase tracking-wider bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-emerald-600" />
            <span>12 MINS</span>
          </span>

          {hasDiscount && (
            <span className="absolute top-2.5 right-2.5 text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs">
              {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
            </span>
          )}

          <img
            src={prod.image}
            alt={prod.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{prod.unit}</p>
          <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2 min-h-[32px]">
            {prod.name}
          </h4>
        </div>
      </div>

      {/* Pricing and Cart Stepper */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-slate-900 text-sm">₹{activePrice}</span>
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through">₹{item.price}</span>
            )}
          </div>
        </div>

        {inCart ? (
          <div className="flex items-center gap-1.5 bg-emerald-700 text-white rounded-xl p-1 shadow-xs">
            <button
              onClick={() => updateQuantity(prod._id, -1)}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-black text-xs"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-black text-xs px-1.5">{inCart.quantity}</span>
            <button
              onClick={() => updateQuantity(prod._id, 1)}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded-lg text-white font-black text-xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item, shop)}
            className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-600 rounded-xl font-extrabold text-xs transition-colors"
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
