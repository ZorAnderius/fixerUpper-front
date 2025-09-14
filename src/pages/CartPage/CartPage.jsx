import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCartItems } from '../../redux/cart/operations';
import { selectCartItems, selectCartLoading, selectCartError, selectCartTotalItems, selectCartTotalPrice } from '../../redux/cart/selectors';
import { selectIsAuthenticated } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../../components/Button/Button';
import { ContentLoader } from '../../components/Loader';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import CartItem from '../../components/CartItem/CartItem';
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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems());
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [dispatch, isAuthenticated, navigate]);



  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleCloseCheckoutModal = () => {
    setShowCheckoutModal(false);
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
          <ContentLoader 
            variant="bars"
            text="Loading cart..." 
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
    <>
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
                    <CartItem key={item.id} item={item} index={index} />
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
                    <div className={styles.buttonsContainer}>
                      <button
                        className={styles.continueShoppingButton}
                        onClick={() => navigate(ROUTES.PRODUCTS)}
                      >
                        Continue Shopping
                      </button>
                      
                      <button
                        className={styles.checkoutButton}
                        onClick={handleCheckout}
                        disabled={isLoading}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </motion.div>
        </Container>
      </Section>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={handleCloseCheckoutModal}
      />
    </>
  );
};

export default CartPage;