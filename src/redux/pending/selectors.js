// Селектори для pending стану
export const selectPendingState = (state) => state.pending;

export const selectPreviousLocation = (state) => state.pending.previousLocation;

export const selectPendingCartItems = (state) => state.pending.pendingCartItems;

export const selectPendingCartItemById = (state, productId) => 
  state.pending.pendingCartItems.find(item => item.productId === productId);

export const selectPendingCartTotalItems = (state) => 
  state.pending.pendingCartItems.reduce((total, item) => total + item.quantity, 0);

export const selectPendingProduct = (state) => state.pending.pendingProduct;

export const selectShowAuthModal = (state) => state.pending.showAuthModal;

export const selectRedirectReason = (state) => state.pending.redirectReason;

export const selectHasPendingItems = (state) => state.pending.pendingCartItems.length > 0;

