import React from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomCartBar = () => {
  const { itemCount, itemsList, isOpenCart, setIsOpenCart } = useCart();

  // Only render when items are added to cart and the cart drawer is not currently open
  if (itemCount === 0 || isOpenCart) return null;

  // Up to 3 preview item images (latest added)
  const previewImages = itemsList.slice(-3);

  return (
    <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
      <button
        type="button"
        onClick={() => setIsOpenCart(true)}
        className="pointer-events-auto bg-[#0c831f] hover:bg-[#0a731b] active:scale-95 transition-all duration-200 rounded-full pl-1.5 pr-4 py-1.5 sm:pl-2 sm:pr-4.5 sm:py-1.5 flex items-center shadow-[0_6px_22px_rgba(0,0,0,0.3)] cursor-pointer border border-white/20 group"
        aria-label="View cart"
      >
        {/* Overlapping Circular Product Thumbnails */}
        <div className="flex items-center shrink-0">
          {previewImages.length > 0 ? (
            previewImages.map((it, idx) => (
              <div
                key={it.productId || idx}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 border-2 border-[#0c831f] shadow-sm flex items-center justify-center overflow-hidden shrink-0 ${
                  idx > 0 ? '-ml-3 sm:-ml-3.5' : ''
                }`}
                style={{ zIndex: idx + 1 }}
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 border-2 border-[#0c831f] shadow-sm flex items-center justify-center text-[#0c831f]">
              <ShoppingBag className="w-4 h-4 text-[#0c831f]" />
            </div>
          )}
        </div>

        {/* Text Details: "View cart" & "X items" */}
        <div className="flex flex-col text-left pl-2 sm:pl-2.5 pr-1">
          <span className="text-[13px] sm:text-[14px] font-bold text-white leading-tight tracking-tight">
            View cart
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-white/90 leading-tight mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right White Arrow Chevron */}
        <div className="pl-1.5 sm:pl-2">
          <ChevronRight className="w-4 h-4 text-white stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
};

export default BottomCartBar;
