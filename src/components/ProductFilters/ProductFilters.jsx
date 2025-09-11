import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { setFilters } from '../../redux/products/slice';
import { selectCategories, selectProductsFilters } from '../../redux/products/selectors';
import { fetchCategories } from '../../redux/products/operations';
import Button from '../Button/Button';
import styles from './ProductFilters.module.css';

const ProductFilters = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const filters = useSelector(selectProductsFilters);
  const hasLoadedCategories = useRef(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    // Load categories only once
    if (!hasLoadedCategories.current) {
      hasLoadedCategories.current = true;
      dispatch(fetchCategories());
    }
  }, []); // Empty dependency array - run only once on mount

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) {
        dispatch(setFilters({ search: searchValue, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, dispatch, filters.search]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const categoryValue = e.target.value === '' ? '' : e.target.value;
    dispatch(setFilters({ category: categoryValue, page: 1 }));
  };

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value, page: 1 }));
  };

  const clearFilters = () => {
    setSearchValue('');
    dispatch(setFilters({ 
      search: '', 
      category: '', 
      sortBy: 'newest', 
      page: 1 
    }));
  };

  const hasActiveFilters = searchValue || filters.category || filters.sortBy !== 'newest';

  return (
    <motion.div 
      className={styles.filtersContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >

      <div className={styles.filtersContent}>
        <div className={styles.filtersGrid}>
          {/* Search */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          {/* Category Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className={styles.selectInput}
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className={styles.selectInput}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className={styles.filterGroup}>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                className={styles.clearButton}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductFilters;