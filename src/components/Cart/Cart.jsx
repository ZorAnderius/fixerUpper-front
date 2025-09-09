import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { closeCart, updateCartItem, removeFromCart, clearCart } from '../../redux/cart/slice';
import { selectCartItems, selectCartTotalPrice, selectIsCartOpen, selectCartLoading } from '../../redux/cart/selectors';
import { checkoutCart } from '../../redux/cart/operations';
import Button from '../Button/Button';
import styles from './Cart.module.css';

const Cart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const isOpen = useSelector(selectIsCartOpen);
  const isLoading = useSelector(selectCartLoading);

  const handleCloseCart = () => {
    dispatch(closeCart());
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateCartItem({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    try {
      // For now, we'll checkout all items at once
      // In a real app, you might want to checkout individual items
      await dispatch(checkoutCart(items[0].id)).unwrap();
      dispatch(closeCart());
    } catch (error) {
      console.error('Checkout failed:', error);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.cartBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCart}
          />
          
          {/* Cart Modal */}
          <motion.div
            className={styles.cartModal}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className={styles.cartHeader}>
              <h2 className={styles.cartTitle}>Shopping Cart</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseCart}
                aria-label="Close cart"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.cartContent}>
              {items.length === 0 ? (
                <div className={styles.emptyCart}>
                  <div className={styles.emptyCartIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6M17 18a2 2 0 100 4 2 2 0 000-4zM9 18a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Add items to your cart to place an order</p>
                </div>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        className={styles.cartItem}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        layout
                      >
                        <div className={styles.itemImage}>
                          {item.product?.product_image ? (
                            <img 
                              src={item.product.product_image} 
                              alt={item.product.title}
                              className={styles.itemImageImg}
                            />
                          ) : (
                            <div className={styles.itemImagePlaceholder}>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className={styles.itemInfo}>
                          <h4 className={styles.itemTitle}>{item.product?.title || 'Product'}</h4>
                          <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                        </div>

                        <div className={styles.itemControls}>
                          <div className={styles.quantityControls}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className={styles.quantityButton}
                            >
                              -
                            </button>
                            <span className={styles.quantityValue}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className={styles.quantityButton}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className={styles.removeButton}
                            aria-label="Remove item"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className={styles.cartFooter}>
                    <div className={styles.cartTotal}>
                      <span className={styles.totalLabel}>Total:</span>
                      <span className={styles.totalPrice}>{formatPrice(totalPrice)}</span>
                    </div>

                    <div className={styles.cartActions}>
                      <Button
                        variant="secondary"
                        onClick={() => dispatch(clearCart())}
                        disabled={isLoading}
                      >
                        Clear Cart
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleCheckout}
                        loading={isLoading}
                        disabled={isLoading}
                        fullWidth
                      >
                        Checkout
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;