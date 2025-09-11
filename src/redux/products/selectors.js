import { createSelector } from '@reduxjs/toolkit';

export const selectProducts = (state) => state.products.items;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectCategories = (state) => state.products.categories;
export const selectProductStatuses = (state) => state.products.productStatuses;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsFilters = (state) => state.products.filters;
export const selectProductsPagination = (state) => state.products.pagination;

export const selectFilteredProducts = createSelector(
  [selectProducts],
  (items) => {
    // Just return the products as they come from the backend
    // Backend now handles filtering and sorting
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items;
  }
);