import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCartItems, updateCartItem, removeFromCart, checkoutCart } from '../../redux/cart/operations';
import { selectCartItems, selectCartLoading, selectCartError, selectCartTotalItems, selectCartTotalPrice } from '../../redux/cart/selectors';
import { selectIsAuthenticated } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../../components/Button/Button';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './CartPage.module.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const cartItems = useSelector(selectCartItems);
  const isLoading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const totalItems = useSelector(selectCartTotalItems);
  const totalPrice = useSelector(selectCartTotalPrice);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems());
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [dispatch, isAuthenticated, navigate]);


  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await dispatch(updateCartItem({ cartItemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await dispatch(removeFromCart(cartItemId)).unwrap();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      // For now, just navigate to a success page
      navigate(ROUTES.ORDERS);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Price not available';
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <LoadingSpinner 
            size="lg" 
            text="Loading cart..." 
            className={styles.loadingContainer}
          />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container>
          <div className={styles.errorContainer}>
            <h2>Error loading cart</h2>
            <p>{error}</p>
            <Button 
              onClick={() => dispatch(fetchCartItems())}
              variant="primary"
            >
              Try Again
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
          className={styles.cartPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.cartContainer}>
            <div className={styles.cartHeader}>
              <h1 className={styles.cartTitle}>🛒 Shopping Cart</h1>
              <p className={styles.cartSubtitle}>
                Review your items and proceed to checkout
              </p>
            </div>

            {cartItems.length === 0 ? (
              <motion.div
                className={styles.emptyCart}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.emptyCartIcon}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className={styles.emptyCartTitle}>Your cart is empty</h2>
                <p className={styles.emptyCartMessage}>
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(ROUTES.PRODUCTS)}
                >
                  Continue Shopping
                </Button>
              </motion.div>
            ) : (
              <div className={styles.cartContent}>
                {/* Cart Items */}
                <div className={styles.cartItemsSection}>
                  <div className={styles.cartItemsHeader}>
                    <h2 className={styles.cartItemsTitle}>Cart Items</h2>
                    <span className={styles.cartItemsCount}>
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className={styles.cartItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className={styles.cartItemImage}>
                        {(item.products?.image_url || item.product?.image_url) ? (
                          <img 
                            src={item.products?.image_url || item.product?.image_url} 
                            alt={item.products?.title || item.product?.title}
                          />
                        ) : (
                          <div className={styles.cartItemImagePlaceholder}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className={styles.cartItemInfo}>
                        <h3 className={styles.cartItemTitle}>
                          {item.products?.title || item.product?.title || 'Unknown Product'}
                        </h3>
                        <p className={styles.cartItemDescription}>
                          {item.products?.description || item.product?.description || 'No description available'}
                        </p>
                        <div className={styles.cartItemPrice}>
                          {formatPrice(item.products?.price || item.price)}
                        </div>
                      </div>

                      <div className={styles.cartItemControls}>
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.quantityButton}
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            className={styles.quantityInput}
                          />
                          <button
                            className={styles.quantityButton}
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className={styles.cartSummary}>
                  <h2 className={styles.cartSummaryTitle}>Order Summary</h2>
                  
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Items ({totalItems})</span>
                    <span className={styles.summaryValue}>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Shipping</span>
                    <span className={styles.summaryValue}>Free</span>
                  </div>
                  
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Tax</span>
                    <span className={styles.summaryValue}>Included</span>
                  </div>

                  <div className={styles.summaryTotal}>
                    <span className={styles.summaryTotalLabel}>Total</span>
                    <span className={styles.summaryTotalValue}>{formatPrice(totalPrice)}</span>
                  </div>

                  <div className={styles.cartActions}>
                    <button
                      className={styles.checkoutButton}
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      <span>🛒</span>
                      <span>Proceed to Checkout</span>
                    </button>
                    
                    <button
                      className={styles.continueShoppingButton}
                      onClick={() => navigate(ROUTES.PRODUCTS)}
                    >
                      <span>🛍️</span>
                      <span>Continue Shopping</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CartPage;