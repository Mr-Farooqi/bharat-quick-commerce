import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('blinkit_cart');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeShop, setActiveShop] = useState(() => {
    const saved = localStorage.getItem('blinkit_active_shop');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOpenCart, setIsOpenCart] = useState(false);

  useEffect(() => {
    localStorage.setItem('blinkit_cart', JSON.stringify(cartItems));
    localStorage.setItem('blinkit_active_shop', JSON.stringify(activeShop));
  }, [cartItems, activeShop]);

  const addToCart = (shopProduct, shop) => {
    // Check if adding from a different shop
    if (activeShop && activeShop._id !== shop._id && Object.keys(cartItems).length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart already has items from "${activeShop.name}". Clear cart and start fresh from "${shop.name}"?`
      );
      if (!confirmSwitch) return;
      clearCart();
    }

    setActiveShop(shop);
    const prodId = shopProduct.product._id;
    const activePrice = shopProduct.discountPrice || shopProduct.price;

    setCartItems((prev) => {
      const existing = prev[prodId];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [prodId]: {
          productId: prodId,
          name: shopProduct.product.name,
          unit: shopProduct.product.unit,
          image: shopProduct.product.image,
          price: activePrice,
          mrp: shopProduct.price,
          quantity: newQty,
          maxStock: shopProduct.stock,
          shopId: shop._id,
        },
      };
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        if (Object.keys(copy).length === 0) {
          setActiveShop(null);
        }
        return copy;
      }

      return {
        ...prev,
        [productId]: {
          ...item,
          quantity: Math.min(newQty, item.maxStock || 99),
        },
      };
    });
  };

  const clearCart = () => {
    setCartItems({});
    setActiveShop(null);
  };

  const itemsList = Object.values(cartItems);
  const itemCount = itemsList.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = itemsList.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 199 ? 0 : 15;
  const totalAmount = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsList,
        activeShop,
        isOpenCart,
        setIsOpenCart,
        addToCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
