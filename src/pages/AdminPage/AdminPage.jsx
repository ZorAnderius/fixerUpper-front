import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAllProducts, deleteProduct } from '../../redux/products/operations';
import { selectProducts, selectProductsLoading, selectProductsError, selectProductsPagination, selectProductsFilters } from '../../redux/products/selectors';
import { selectUser, selectIsAdmin } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../../components/ProductModal/ProductModal';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import Pagination from '../../components/Pagination/Pagination';
import Button from '../../components/Button/Button';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const pagination = useSelector(selectProductsPagination);
  const filters = useSelector(selectProductsFilters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // console.log('AdminPage state:', { isModalOpen, modalMode, selectedProduct });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllProducts());
    }
    // Don't redirect here, let the component handle the access denied message
  }, [dispatch, isAdmin]);

  // Fetch products when filters change
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllProducts(filters));
    }
  }, [dispatch, filters, isAdmin]);

  const handleCreateProduct = () => {
    navigate(ROUTES.ADMIN_ADD_PRODUCT);
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete.id)).unwrap();
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Failed to delete product:', error);
        // Error is already handled by Redux and displayed in UI
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      }
    }
  };

  const formatPrice = (price) => {
    // Convert string to number if needed
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return 'Price not available';
    }
    
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  };

  if (!user) {
    return (
      <Section>
        <Container>
          <div className={styles.notAuthenticated}>
            <h2>Authentication Required</h2>
            <p>Please log in to access the admin panel</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Log In
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (user.role !== 'administrator') {
    return (
      <Section>
        <Container>
          <div className={styles.accessDenied}>
            <h2>Access Denied</h2>
            <p>You don't have permission to access the admin panel</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(ROUTES.PRODUCTS)}
            >
              Return to Catalog
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <motion.div
          className={styles.adminPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className={styles.adminHeader}>
            <div className={styles.headerInfo}>
              <h1 className={styles.adminTitle}>Admin Panel</h1>
              <p className={styles.adminSubtitle}>
                Product Management 
                {pagination.totalItems > 0 && (
                  <span className={styles.productCount}>
                    ({pagination.totalItems} products)
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateProduct}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Product
            </Button>
          </div>

          {/* Filters */}
          <ProductFilters />

          {/* Products List */}
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <h3>Loading Error</h3>
              <p>{error}</p>
              <Button 
                variant="primary" 
                onClick={() => dispatch(fetchAllProducts())}
              >
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>No Products</h3>
              <p>Create your first product to get started</p>
              <Button 
                variant="primary" 
                onClick={handleCreateProduct}
              >
                Create Product
              </Button>
            </div>
          ) : (
            <div className={styles.productsList}>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className={styles.productCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={styles.productImage}>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className={styles.productImageImg}
                      />
                    ) : (
                      <div className={styles.productImagePlaceholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                    <p className={styles.productDescription}>
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
                        : product.description
                      }
                    </p>
                    <div className={styles.productMeta}>
                      <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                      <span className={styles.productQuantity}>
                        Quantity: {product.quantity}
                      </span>
                    </div>
                  </div>

                  <div className={styles.productActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {products.length > 0 && <Pagination />}
        </motion.div>

        {/* Product Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          mode={modalMode}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <motion.div
              className={styles.confirmModal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3>Confirm Deletion</h3>
              <p>
                Are you sure you want to delete the product "{productToDelete?.title}"? 
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default AdminPage;



