import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cart');
      const parsed = localData ? JSON.parse(localData) : [];
      if (Array.isArray(parsed)) {
        // Safe check: filter out any corrupted legacy cart formats
        return parsed.filter(item => item && item.product && item.product._id);
      }
      return [];
    } catch (err) {
      console.error('Error loading cart:', err);
      return [];
    }
  });

  // Sync cart items with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, bundleQty, color) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product &&
          item.product._id === product._id &&
          item.color === color
      );

      const piecesPerBundle = product.piecesPerBundle || 5;
      const pricePerPiece = product.pricePerPiece || product.price;

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].bundleQty += Number(bundleQty);
        newItems[existingItemIndex].totalPrice = newItems[existingItemIndex].bundleQty * piecesPerBundle * pricePerPiece;
        return newItems;
      } else {
        return [
          ...prevItems,
          {
            product,
            color,
            bundleQty: Number(bundleQty),
            piecesPerBundle,
            pricePerPiece,
            totalPrice: Number(bundleQty) * piecesPerBundle * pricePerPiece
          }
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId, color) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product &&
            item.product._id === productId &&
            item.color === color
          )
      )
    );
  };

  // Update quantity of specific item
  const updateQuantity = (productId, color, bundleQty) => {
    if (bundleQty <= 0) {
      removeFromCart(productId, color);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product && item.product._id === productId && item.color === color) {
          const piecesPerBundle = item.piecesPerBundle || 5;
          const pricePerPiece = item.pricePerPiece || item.product.pricePerPiece;
          return {
            ...item,
            bundleQty: Number(bundleQty),
            totalPrice: Number(bundleQty) * piecesPerBundle * pricePerPiece
          };
        }
        return item;
      })
    );
  };

  // Clear all cart items
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate totals
  const totalAmount = cartItems.reduce(
    (sum, item) => {
      if (item && item.totalPrice) {
        return sum + item.totalPrice;
      }
      return sum;
    },
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + ((item.bundleQty || 0) * (item.piecesPerBundle || 5)), 0);

  // Group by product ID to check if total quantity for a product meets its MOQ
  const getProductTotalQuantities = () => {
    const totals = {};
    cartItems.forEach((item) => {
      if (item && item.product && item.product._id) {
        const id = item.product._id;
        const pieces = (item.bundleQty || 0) * (item.piecesPerBundle || 5);
        totals[id] = (totals[id] || 0) + pieces;
      }
    });
    return totals;
  };

  const productTotals = getProductTotalQuantities();

  // Validate MOQs
  // Returns an array of items/products that fail their MOQ requirement
  const getUnderMoqItems = () => {
    const underMoq = [];
    const checkedProductIds = new Set();

    cartItems.forEach((item) => {
      if (!item || !item.product || !item.product._id) return;
      const productId = item.product._id;
      if (checkedProductIds.has(productId)) return;
      checkedProductIds.add(productId);

      const totalQty = productTotals[productId] || 0;
      const moq = item.product.moq || 50;

      if (totalQty < moq) {
        underMoq.push({
          product: item.product,
          currentQuantity: totalQty,
          moq: moq,
          needed: moq - totalQty
        });
      }
    });

    return underMoq;
  };

  const underMoqItems = getUnderMoqItems();
  const isMoqMet = underMoqItems.length === 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        totalItems,
        isMoqMet,
        underMoqItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
