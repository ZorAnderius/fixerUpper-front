import { useEffect, useRef } from 'react';
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

  // Debug logging
  console.log('ProductFilters render - categories:', categories);
  console.log('ProductFilters render - categories type:', typeof categories);
  console.log('ProductFilters render - isArray:', Array.isArray(categories));
  console.log('ProductFilters render - categories length:', categories?.length);

  useEffect(() => {
    // Load categories only once
    if (!hasLoadedCategories.current) {
      console.log('ProductFilters - dispatching fetchCategories (first time)');
      hasLoadedCategories.current = true;
      dispatch(fetchCategories());
    } else {
      console.log('ProductFilters - categories already requested, skipping fetch');
    }
  }, []); // Empty dependency array - run only once on mount

  const handleSearchChange = (e) => {
    dispatch(setFilters({ search: e.target.value, page: 1 }));
  };

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value, page: 1 }));
  };

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value, page: 1 }));
  };

  const clearFilters = () => {
    dispatch(setFilters({ 
      search: '', 
      category: '', 
      sortBy: 'newest', 
      page: 1 
    }));
  };

  const hasActiveFilters = filters.search || filters.category || filters.sortBy !== 'newest';

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
              value={filters.search}
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