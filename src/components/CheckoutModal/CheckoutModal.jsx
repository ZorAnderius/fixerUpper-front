import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkoutCart } from '../../redux/cart/operations';
import { selectCartItems, selectCartTotalPrice, selectCartId, selectCartLoading } from '../../redux/cart/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../Button/Button';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './CheckoutModal.module.css';

const CheckoutModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const cartId = useSelector(selectCartId);
  const isLoading = useSelector(selectCartLoading);

  const handleCheckout = async () => {
    if (!cartId) {
      alert('Error: No cart ID found. Please refresh and try again.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Error: Your cart is empty. Please add items before checkout.');
      return;
    }

    try {
      const result = await dispatch(checkoutCart(cartId)).unwrap();
      
      // Navigate to orders page with success message
      navigate(ROUTES.ORDERS, { 
        state: { 
          showSuccessMessage: true,
          orderNumber: result.data?.orderNumber || result.orderNumber,
          totalPrice: result.data?.totalPrice || result.totalPrice 
        } 
      });
      
      onClose();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(`Checkout failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Confirm Checkout</h2>
            <button 
              className={styles.closeButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.itemsList}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>
                        {item.products?.title || item.product?.title || 'Unknown Product'}
                      </h4>
                      <p className={styles.itemQuantity}>
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className={styles.itemPrice}>
                      £{((item.products?.price || item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.totalSection}>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalPrice}>£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.confirmationText}>
              <p>Are you sure you want to proceed with this order?</p>
              <p className={styles.warningText}>
                This action cannot be undone. Your cart will be cleared after checkout.
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={isLoading || !cartId}
              className={styles.checkoutButton}
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                `Proceed to Checkout - £${totalPrice.toFixed(2)}`
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
