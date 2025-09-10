import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchProductById, deleteProduct } from '../../redux/products/operations';
import { selectCurrentProduct, selectProductsLoading, selectProductsError } from '../../redux/products/selectors';
import { selectUser, selectIsAuthenticated } from '../../redux/auth/selectors';
import { addToCart } from '../../redux/cart/operations';
import { selectCartItemById } from '../../redux/cart/selectors';
import { addToPendingCartAndShowAuth } from '../../redux/pending/operations';
import { setPreviousLocation, setRedirectReason } from '../../redux/pending/slice';
import { selectShowAuthModal } from '../../redux/pending/selectors';
import { setShowAuthModal } from '../../redux/pending/slice';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../../components/Button/Button';
import AuthModal from '../../components/AuthModal/AuthModal';
import styles from './ProductDetailsPage.module.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const product = useSelector(selectCurrentProduct);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartItem = useSelector(selectCartItemById(id));
  
  const [quantity, setQuantity] = useState(1);
  const showAuthModal = useSelector(selectShowAuthModal);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  // Handle return after login
  useEffect(() => {
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem && product) {
      try {
        const cartData = JSON.parse(pendingCartItem);
        // Check if it's the same product
        if (cartData.productId === product?.id) {
          // Add product to cart
          dispatch(addToCart({
            productId: product.id,
            quantity: cartData.quantity || 1
          }));
          // Clear saved data
          localStorage.removeItem('pendingCartItem');
        }
      } catch (error) {
        console.error('Failed to parse pending cart item:', error);
        localStorage.removeItem('pendingCartItem');
      }
    }
  }, [product, dispatch]);

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Зберігаємо поточну сторінку
      dispatch(setPreviousLocation(location.pathname));
      
      // Додаємо товар в pending кошик та показуємо модальку
      dispatch(addToPendingCartAndShowAuth({
        productId: product.id,
        quantity: quantity,
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          image_url: product.image_url
        },
        reason: 'add_to_cart'
      }));
      
      return;
    }

    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity: quantity
      })).unwrap();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleDeleteProduct = async () => {
    if (product) {
      try {
        await dispatch(deleteProduct(product.id)).unwrap();
        navigate(ROUTES.PRODUCTS);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };


  const formatPrice = (price) => {
    console.log('formatPrice called with:', price, 'type:', typeof price);
    if (price === null || price === undefined || isNaN(price)) {
      console.log('Invalid price value:', price);
      return 'Price not available';
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product not found</h2>
        <p>{error || 'Product with this ID does not exist'}</p>
        <Button 
          variant="primary"
          onClick={() => navigate(ROUTES.PRODUCTS)}
        >
          Return to catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.productDetails}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumb}>
        <button
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className={styles.breadcrumbLink}
        >
          🏠 Catalogue
        </button>
        <span className={styles.breadcrumbSeparator}>→</span>
        <span className={styles.breadcrumbCurrent}>{product.title}</span>
      </div>

      <div className={styles.productContent}>
        {/* Product Title Section */}
        <div className={styles.productTitleSection}>
          <motion.h1 
            className={styles.productTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.title}
          </motion.h1>
        </div>

        {/* Product Details Grid */}
        <div className={styles.productDetailsGrid}>
          {/* Product Image */}
          <div className={styles.productImageSection}>
            <div className={styles.productImage}>
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className={styles.productImageImg}
                />
              ) : (
                <div className={styles.productImagePlaceholder}>
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <motion.div 
              className={styles.productPrice}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {formatPrice(product.price)}
            </motion.div>

            <motion.div 
              className={styles.addToCartSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {product.quantity > 0 && (
                <div className={styles.quantitySelector}>
                  <label className={styles.quantityLabel}>🔢 Quantity:</label>
                  <div className={styles.quantityControls}>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className={styles.quantityButton}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.quantity}
                      className={styles.quantityInput}
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.quantity}
                      className={styles.quantityButton}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.buyButton}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  fullWidth
                >
                  {cartItem ? '🛒 In Cart' : '🛒 Buy Now'}
                </Button>
              </div>

              <div className={styles.productStatus}>
                <span className={`${styles.statusBadge} ${product.quantity > 0 ? styles.inStock : styles.outOfStock}`}>
                  {product.quantity > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
              </div>
            </motion.div>

            <div className={styles.productDescription}>
              <h3>📋 Product Description</h3>
              <p>{product.description}</p>
            </div>

            {isAdmin && (
              <div className={styles.adminActions}>
                <h3>⚙️ Administrative Actions</h3>
                <div className={styles.adminButtons}>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`${ROUTES.ADMIN}/edit/${product.id}`)}
                  >
                    ✏️ Edit Product
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    🗑️ Delete Product
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => dispatch(setShowAuthModal(false))}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>⚠️ Confirm Deletion</h3>
            <p>Are you sure you want to delete the product "{product.title}"? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                ❌ Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteProduct}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;