import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAllProducts, fetchCategories } from '../../redux/products/operations';
import { selectFilteredProducts, selectProductsLoading, selectProductsError } from '../../redux/products/selectors';
import { selectShowAuthModal } from '../../redux/pending/selectors';
import { setShowAuthModal } from '../../redux/pending/slice';
import { staggerContainer, staggerItem } from '../../helpers/animations/variants';
import { useRef } from 'react';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import ProductCard from '../../components/ProductCard/ProductCard';
import Pagination from '../../components/Pagination/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import AuthModal from '../../components/AuthModal/AuthModal';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './ProductsPage.module.css';

const ProductsPage = () => {
  console.log('ProductsPage component is rendering!');
  const dispatch = useDispatch();
  const products = useSelector(selectFilteredProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const showAuthModal = useSelector(selectShowAuthModal);

  // Debug logging
  console.log('ProductsPage render - products:', products);
  console.log('ProductsPage render - products type:', typeof products);
  console.log('ProductsPage render - isArray:', Array.isArray(products));
  console.log('ProductsPage render - products length:', products?.length);
  console.log('ProductsPage render - isLoading:', isLoading);
  console.log('ProductsPage render - error:', error);
  // Simplified animation - no staggered visibility
  const ref = useRef(null);

  useEffect(() => {
    // Fetch products and categories on component mount
    dispatch(fetchAllProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAuthRequired = () => {
    dispatch(setShowAuthModal(true));
  };

  const handleCloseAuthModal = () => {
    dispatch(setShowAuthModal(false));
  };

  if (error) {
    return (
      <Section>
        <Container>
          <div className={styles.errorContainer}>
            <h2>Error loading products</h2>
            <p>{error}</p>
            <button 
              onClick={() => {
                dispatch(fetchAllProducts());
                dispatch(fetchCategories());
              }}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </Container>
      </Section>
    );
  }

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
            <LoadingSpinner 
              size="lg" 
              text="Loading products..."
              className={styles.loadingContainer}
            />
          ) : products.length === 0 ? (
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
            <motion.div
              ref={ref}
              className={styles.productsGrid}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  custom={index}
                >
                  <ProductCard 
                    product={product} 
                    index={index} 
                    onAuthRequired={handleAuthRequired}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <Pagination />
        </motion.div>
      </Container>
      
      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
      />
    </Section>
  );
};

export default ProductsPage;
