import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOrderById } from '../../redux/orders/operations';
import { closeOrderModal } from '../../redux/orders/slice';
import { selectCurrentOrder, selectIsOrderModalOpen, selectOrdersLoading } from '../../redux/orders/selectors';
import Button from '../Button/Button';
import styles from './OrderDetailsModal.module.css';

const OrderDetailsModal = () => {
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const isOpen = useSelector(selectIsOrderModalOpen);
  const isLoading = useSelector(selectOrdersLoading);

  const handleClose = () => {
    dispatch(closeOrderModal());
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return styles.statusCompleted;
      case 'pending':
      case 'processing':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Order Details</h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalContent}>
              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading order details...</p>
                </div>
              ) : order ? (
                <>
                  {/* Order Info */}
                  <div className={styles.orderInfo}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderNumber}>
                        <h3>Order #{order.id.slice(-8)}</h3>
                        <p className={styles.orderDate}>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className={styles.orderStatus}>
                        <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={styles.orderItems}>
                    <h4>Items in order:</h4>
                    <div className={styles.itemsList}>
                      {order.items?.map((item, index) => (
                        <motion.div
                          key={item.id || index}
                          className={styles.orderItem}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
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

                          <div className={styles.itemDetails}>
                            <h5 className={styles.itemTitle}>
                              {item.product?.title || 'Product'}
                            </h5>
                            <p className={styles.itemQuantity}>
                              Quantity: {item.quantity}
                            </p>
                            <p className={styles.itemPrice}>
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <div className={styles.itemTotal}>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                      <span>Number of items:</span>
                      <span>{order.items?.length || 0}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Total amount:</span>
                      <span className={styles.totalAmount}>
                        {formatPrice(order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.errorContainer}>
                  <h3>Loading error</h3>
                  <p>Failed to load order details</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={handleClose}
                fullWidth
              >
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
