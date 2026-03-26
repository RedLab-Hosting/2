import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('prysma_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart from storage", e);
      }
    }
  }, []);

  // Save cart to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('prysma_cart', JSON.stringify(cart));
  }, [cart]);

  /**
   * Generates a unique key for a cart item based on its ID and selected modifiers.
   * This ensures that two identical products with different modifiers are treated as different items.
   */
  const getItemKey = (product, selectedModifiers) => {
    const modifiersString = selectedModifiers 
      ? Object.entries(selectedModifiers)
          .sort()
          .map(([k, v]) => `${k}:${v}`)
          .join('|')
      : '';
    return `${product.id}-${modifiersString}`;
  };

  const addToCart = (product, selectedModifiers, quantity = 1) => {
    const key = getItemKey(product, selectedModifiers);
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.key === key);
      
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { 
          ...product, 
          selectedModifiers, 
          quantity, 
          key 
        }];
      }
    });
  };

  const removeFromCart = (key) => {
    setCart(prevCart => prevCart.filter(item => item.key !== key));
  };

  const updateQuantity = (key, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.key === key) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const cartTotalUSD = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Note: bolivares total will depend on the BCV rate from exchangeRateService or Context
  const getCartTotalBS = (rate) => cartTotalUSD * rate;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to get product quantity in cart (for ProductCard indicators)
  const getProductQuantity = (productId) => {
    return cart
      .filter(item => item.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotalUSD, 
      getCartTotalBS,
      cartCount,
      getProductQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
