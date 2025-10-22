import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAllProducts, fetchCategories } from '../../redux/products/operations';
import { selectFilteredProducts, selectProductsLoading, selectProductsError, selectProductsFilters } from '../../redux/products/selectors';
import { staggerContainer, staggerItem } from '../../helpers/animations/variants';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import ProductCard from '../../components/ProductCard/ProductCard';
import Pagination from '../../components/Pagination/Pagination';
import { ContentLoader } from '../../components/Loader';
import AuthModal from '../../components/AuthModal/AuthModal';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './ProductsPage.module.css';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectFilteredProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const filters = useSelector(selectProductsFilters);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Simplified animation - no staggered visibility
  const ref = useRef(null);

  // Fetch categories only once on component mount
  useEffect(() => {
    // Clear any previous errors when entering products page - SYNCHRONOUS
    dispatch({ type: 'products/clearError' });
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchAllProducts(filters));
  }, [dispatch, filters]);

  // Show error modal when there's an error - ONLY IN MODAL, NEVER ON PAGE
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleRetryProducts = () => {
    setShowErrorModal(false);
    dispatch(fetchAllProducts(filters));
  };

  return (
    <Section>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProductFilters />
          
          {isLoading ? (
            <ContentLoader 
              variant="dots"
              text="Loading products..."
            />
          ) : (
            <>
              {products.length === 0 ? (
                <div className={styles.emptyContainer}>
                  <div className={styles.emptyIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>No Products Found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div
                  className={styles.productsList}
                >
                  {products.map((product, index) => (
                    <ProductCard 
                      key={product.id}
                      product={product} 
                      index={index} 
                      onAuthRequired={handleAuthRequired}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          <Pagination />
        </motion.div>
      </Container>
      
      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
      />
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className={styles.errorModal}>
          <div className={styles.errorModalContent}>
            <h3>Error Loading Products</h3>
            <p>{error}</p>
            <div className={styles.errorModalActions}>
              <button 
                onClick={handleRetryProducts}
                className={styles.retryButton}
              >
                Try Again
              </button>
              <button 
                onClick={handleCloseErrorModal}
                className={styles.closeButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default ProductsPage;
