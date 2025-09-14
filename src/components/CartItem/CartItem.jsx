import React, { memo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../../redux/cart/operations';
import styles from './CartItem.module.css';

const CartItem = memo(({ item, index }) => {
  const dispatch = useDispatch();
  const updateTimeoutRef = useRef(null);

  const handleQuantityChange = useCallback((cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Clear previous timeout to prevent spam requests
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Calculate difference for backend (backend adds to existing quantity)
    const difference = newQuantity - item.quantity;
    
    // Debounce the update by 300ms
    updateTimeoutRef.current = setTimeout(() => {
      dispatch(updateCartItem({ cartItemId, quantity: difference }));
    }, 300);
  }, [dispatch, item.quantity]);

  const handleRemoveItem = useCallback((cartItemId) => {
    dispatch(removeFromCart(cartItemId));
  }, [dispatch]);

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

  return (
    <motion.div
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
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
