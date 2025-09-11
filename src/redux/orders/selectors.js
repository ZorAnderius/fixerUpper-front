export const selectOrders = (state) => state.orders.items;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectIsOrderModalOpen = (state) => state.orders.isOrderModalOpen;

export const selectOrderById = (orderId) => (state) => 
  state.orders.items.find(order => order.id === orderId);

export const selectRecentOrders = (limit = 5) => (state) => 
  state.orders.items
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);






