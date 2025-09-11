export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartTotalPrice = (state) => state.cart.totalPrice;
export const selectCartId = (state) => state.cart.cartId;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;

export const selectCartItemById = (productId) => (state) => 
  state.cart.items.find(item => 
    item.product_id === productId || 
    item.products?.id === productId || 
    item.product?.id === productId
  );

export const selectCartItemCount = (state) => state.cart.items.length;






