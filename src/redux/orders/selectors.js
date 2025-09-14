export const selectOrders = (state) => state.orders.items;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectIsOrderModalOpen = (state) => state.orders.isOrderModalOpen;

// Pagination selectors
export const selectOrdersPagination = (state) => state.orders.pagination;
export const selectCurrentPage = (state) => state.orders.pagination?.page || 1;
export const selectTotalPages = (state) => state.orders.pagination?.totalPages || 1;
export const selectHasNextPage = (state) => state.orders.pagination?.hasNextPage || false;
export const selectHasPreviousPage = (state) => state.orders.pagination?.hasPreviousPage || false;
export const selectTotalItems = (state) => state.orders.pagination?.totalItems || 0;

export const selectOrderById = (orderId) => (state) => 
  state.orders.items.find(order => order.id === orderId);

export const selectRecentOrders = (limit = 5) => (state) => 
  state.orders.items
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);









