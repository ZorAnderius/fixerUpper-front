import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { setFilters } from '../../redux/products/slice';
import { selectProductsPagination } from '../../redux/products/selectors';
import Button from '../Button/Button';
import styles from './Pagination.module.css';

const Pagination = () => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectProductsPagination);

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
      <div className={styles.paginationInfo}>
        Показано {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} 
        з {pagination.totalItems} товарів
      </div>
      
      <div className={styles.paginationControls}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          Попередня
        </Button>
        
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
                <Button
                  variant={page === pagination.currentPage ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={styles.pageButton}
                >
                  {page}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Наступна
        </Button>
      </div>
    </div>
  );
};

export default Pagination;







