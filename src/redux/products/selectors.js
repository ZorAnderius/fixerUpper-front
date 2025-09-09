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
  [selectProducts, selectProductsFilters],
  (items, filters) => {
    // Ensure items is an array
    if (!Array.isArray(items)) {
      return [];
    }
    
    // Ensure filters is an object
    if (!filters || typeof filters !== 'object') {
      return items;
    }
    
    let filtered = [...items];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(product => product.category_id === filters.category);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort products
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }
);