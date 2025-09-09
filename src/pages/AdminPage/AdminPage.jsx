import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAllProducts, deleteProduct } from '../../redux/products/operations';
import { selectProducts, selectProductsLoading, selectProductsError } from '../../redux/products/selectors';
import { selectUser } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../../components/ProductModal/ProductModal';
import Button from '../../components/Button/Button';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, user]);

  const handleCreateProduct = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsModalOpen(true);
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
            <h2>Потрібна авторизація</h2>
            <p>Увійдіть в систему, щоб отримати доступ до адмін панелі</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Увійти
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (user.role !== 'admin') {
    return (
      <Section>
        <Container>
          <div className={styles.accessDenied}>
            <h2>Доступ заборонено</h2>
            <p>У вас немає прав для доступу до адмін панелі</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(ROUTES.PRODUCTS)}
            >
              Повернутися до каталогу
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
              <h1 className={styles.adminTitle}>Адмін панель</h1>
              <p className={styles.adminSubtitle}>Управління товарами</p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateProduct}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Додати товар
            </Button>
          </div>

          {/* Products List */}
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Завантаження товарів...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <h3>Помилка завантаження</h3>
              <p>{error}</p>
              <Button 
                variant="primary" 
                onClick={() => dispatch(fetchAllProducts())}
              >
                Спробувати знову
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Немає товарів</h3>
              <p>Створіть перший товар, щоб почати</p>
              <Button 
                variant="primary" 
                onClick={handleCreateProduct}
              >
                Створити товар
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
                    {product.product_image ? (
                      <img 
                        src={product.product_image} 
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
                      Редагувати
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      Видалити
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
              <h3>Підтвердження видалення</h3>
              <p>
                Ви впевнені, що хочете видалити товар "{productToDelete?.title}"? 
                Цю дію неможливо скасувати.
              </p>
              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }}
                >
                  Скасувати
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                >
                  Видалити
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



