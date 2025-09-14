import { createSelector } from '@reduxjs/toolkit';

// Get cart items as array from normalized state
export const selectCartItems = createSelector(
  [(state) => state.cart.itemsById, (state) => state.cart.itemIds],
  (itemsById, itemIds) => {
    return itemIds.map(id => itemsById[id]).filter(Boolean);
  }
);

// Calculate total items count
export const selectCartTotalItems = createSelector(
  [(state) => state.cart.itemsById, (state) => state.cart.itemIds],
  (itemsById, itemIds) => {
    return itemIds.reduce((total, id) => {
      const item = itemsById[id];
      return total + (item?.quantity || 0);
    }, 0);
  }
);

// Calculate total price
export const selectCartTotalPrice = createSelector(
  [(state) => state.cart.itemsById, (state) => state.cart.itemIds],
  (itemsById, itemIds) => {
    return itemIds.reduce((total, id) => {
      const item = itemsById[id];
      if (!item) return total;
      
      const price = parseFloat(item.products?.price || item.product?.price || item.price || 0);
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  }
);

export const selectCartId = (state) => state.cart.cartId;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;

export const selectCartItemById = (productId) => createSelector(
  [(state) => state.cart.itemsById, (state) => state.cart.itemIds],
  (itemsById, itemIds) => {
    for (const id of itemIds) {
      const item = itemsById[id];
      if (item && (
        item.product_id === productId || 
        item.products?.id === productId || 
        item.product?.id === productId
      )) {
        return item;
      }
    }
    return null;
  }
);

export const selectCartItemCount = (state) => state.cart.itemIds.length;