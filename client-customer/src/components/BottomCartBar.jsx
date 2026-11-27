import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomCartBar = () => {
  const { itemCount, totalAmount, subtotal, itemsList, isOpenCart, setIsOpenCart } = useCart();

  // Only render when items are added to cart and the cart drawer is not currently open
  if (itemCount === 0 || isOpenCart) return null;

  // Up to 3 preview item images
  const previewImages = itemsList.slice(0, 3);

  return (
    <aside aria-label="Quick Cart" className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none">
      <button
        type="button"
        onClick={() => setIsOpenCart(true)}
        className="pointer-events-auto w-full max-w-lg bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl shadow-emerald-950/40 border border-emerald-400/30 flex items-center justify-between gap-3 cursor-pointer transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] select-none text-left"
      >
        {/* Left Side: Overlapping item image previews + Item count & Price */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Overlapping Thumbnails */}
          <div className="flex -space-x-2.5 shrink-0">
            {previewImages.length > 0 ? (
              previewImages.map((it, idx) => (
                <div
                  key={it.productId || idx}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border-2 border-emerald-800 shadow-md flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5 text-emerald-200" />
              </div>
            )}
          </div>

          {/* Texts: Count & Total Amount */}
          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
              <span className="text-sm sm:text-base font-black text-amber-300">
                ₹{totalAmount}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-100 truncate">
              {totalAmount >= 199 ? '🎉 Free Delivery Unlocked' : `Add ₹${199 - subtotal} more for Free Delivery`}
            </p>
          </div>
        </div>

        {/* Right Side: "View Cart" CTA Button */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-md transition-colors">
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
          <span>View Cart</span>
          <ChevronRight className="w-4 h-4 text-emerald-800 stroke-[3]" />
        </div>
      </button>
    </aside>
  );
};

export default BottomCartBar;
