const initialState = {
  items: [],
  currentProduct: null,
  categories: [],
  productStatuses: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    sortBy: 'newest',
    page: 1,
    limit: 12
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  }
};

export default initialState;






