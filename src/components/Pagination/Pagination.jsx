import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { setFilters } from '../../redux/products/slice';
import { selectProductsPagination, selectProductsFilters } from '../../redux/products/selectors';
import { fetchAllProducts } from '../../redux/products/operations';
import styles from './Pagination.module.css';

const Pagination = () => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectProductsPagination);
  const filters = useSelector(selectProductsFilters);


  // Fetch products when page changes
  useEffect(() => {
    if (filters.page && filters.page > 1) {
      dispatch(fetchAllProducts(filters));
    }
  }, [dispatch, filters.page, filters.category, filters.search, filters.sortBy]);

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;
    
    // Always show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) {
        pages.push('...');
      }
    }
    
    // Show pages around current page
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationControls}>
        {/* First Page */}
        <button
          className={styles.pageButton}
          onClick={() => handlePageChange(1)}
          disabled={pagination.currentPage === 1}
          title="First page"
        >
          ««
        </button>
        
        {/* Previous Page */}
        <button
          className={styles.pageButton}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          title="Previous page"
        >
          «
        </button>
        
        <div className={styles.pageNumbers}>
          {generatePageNumbers().map((page, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {page === '...' ? (
                <span className={styles.ellipsis}>...</span>
              ) : (
                <button
                  className={`${styles.pageButton} ${page === pagination.currentPage ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Next Page */}
        <button
          className={styles.pageButton}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          title="Next page"
        >
          »
        </button>
        
        {/* Last Page */}
        <button
          className={styles.pageButton}
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={pagination.currentPage === pagination.totalPages}
          title="Last page"
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;











