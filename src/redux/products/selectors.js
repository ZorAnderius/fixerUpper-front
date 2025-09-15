import { createSelector } from '@reduxjs/toolkit';

export const selectProducts = (state) => state.products.items;
export const selectCurrentProduct = (state) => state.products.currentProduct;
// Simple selectors for categories and statuses (no memoization needed for simple state access)
export const selectCategories = (state) => state.products.categories;
export const selectProductStatuses = (state) => state.products.productStatuses;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsError = (state) => state.products.error;
// Simple selector for filters (no memoization needed for simple state access)
export const selectProductsFilters = (state) => state.products.filters;

// Memoized pagination selector
export const selectProductsPagination = createSelector(
  [(state) => state.products.pagination],
  (pagination) => pagination
);

// Simple selector for filtered products (backend handles filtering)
export const selectFilteredProducts = (state) => {
  const items = state.products.items;
  return Array.isArray(items) ? items : [];
};