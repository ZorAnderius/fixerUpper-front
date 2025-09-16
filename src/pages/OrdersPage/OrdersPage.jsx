import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../redux/orders/operations';
import { 
  selectOrders, 
  selectOrdersLoading, 
  selectOrdersError,
  selectCurrentPage,
  selectTotalPages,
  selectHasNextPage,
  selectHasPreviousPage,
  selectTotalItems
} from '../../redux/orders/selectors';
import { selectIsAuthenticated } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../../components/Button/Button';
import { ContentLoader } from '../../components/Loader';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './OrdersPage.module.css';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const orders = useSelector(selectOrders);
  const isLoading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const currentPage = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);
  const hasNextPage = useSelector(selectHasNextPage);
  const hasPreviousPage = useSelector(selectHasPreviousPage);
  const totalItems = useSelector(selectTotalItems);
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handlePageChange = (newPage) => {
    dispatch(fetchAllOrders({ page: newPage, limit: 5 }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllOrders({ page: currentPage, limit: 5 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
  }, [orders, isLoading, error, isAuthenticated, currentPage, totalPages, totalItems, hasNextPage, hasPreviousPage]);

  useEffect(() => {
    if (location.state?.showSuccessMessage) {
      setShowSuccessMessage(true);
      setSuccessData({
        orderNumber: location.state.orderNumber,
        totalPrice: location.state.totalPrice
      });
      
      // Clear the state after showing the message
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    setSuccessData(null);
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <ContentLoader 
            variant="ring"
            text="Loading orders..." 
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
            <h2>Error loading orders</h2>
            <p>{error}</p>
            <Button 
              onClick={() => dispatch(fetchAllOrders())}
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
          className={styles.ordersPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.ordersHeader}>
            <h1 className={styles.ordersTitle}>📦 My Orders</h1>
            <p className={styles.ordersSubtitle}>
              Track your orders and view order history
            </p>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccessMessage && successData && (
              <motion.div
                className={styles.successMessage}
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.successIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="2"/>
                    <path d="m9 12 2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.successContent}>
                  <h3>Order Confirmed!</h3>
                  <p>Your order #{successData.orderNumber} has been successfully placed.</p>
                  <p>Total: {formatPrice(successData.totalPrice)}</p>
                </div>
                <button
                  className={styles.closeSuccessButton}
                  onClick={handleCloseSuccessMessage}
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always show Start Shopping button after successful checkout */}
          {showSuccessMessage && successData ? (
            <motion.div
              className={styles.checkoutSuccess}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={styles.successIconLarge}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="2"/>
                  <path d="m9 12 2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.successTitle}>Thank you for your order!</h2>
              <p className={styles.successDescription}>
                Your order has been successfully placed. You will receive an email confirmation shortly.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className={styles.startShoppingButton}
              >
                Continue Shopping
              </Button>
            </motion.div>
          ) : orders.length === 0 ? (
            <motion.div
              className={styles.emptyOrders}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.emptyOrdersIcon}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.emptyOrdersTitle}>No orders yet</h2>
              <p className={styles.emptyOrdersMessage}>
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(ROUTES.PRODUCTS)}
              >
                Start Shopping
              </Button>
            </motion.div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className={styles.orderCard}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <h3 className={styles.orderNumber}>
                        Order #{order.order_number || order.id?.slice(-8)}
                      </h3>
                      <p className={styles.orderDate}>
                        {formatDate(order.createdAt || order.created_at)}
                      </p>
                    </div>
                    <div className={styles.orderStatus}>
                      <span className={styles.statusBadge}>
                        {order.status || 'Processing'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderDetails}>
                    <div className={styles.orderItems}>
                      <span className={styles.itemsLabel}>
                        Items: {order.orderItems?.length || 0}
                      </span>
                    </div>
                    <div className={styles.orderTotal}>
                      <span className={styles.totalLabel}>Total:</span>
                      <span className={styles.totalValue}>
                        {formatPrice(order.total_price || order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderActions}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigate(`${ROUTES.ORDERS}/${order.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pagination - Hide when showing success message */}
          {totalPages > 1 && !showSuccessMessage && (
            <div className={styles.pagination}>
              <div className={styles.paginationControls}>
                {/* First Page */}
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  ««
                </button>
                
                {/* Previous Page */}
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  title="Previous page"
                >
                  «
                </button>
                
                {/* Page Numbers */}
                <div className={styles.pageNumbers}>
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(
                          <button
                            key={i}
                            className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                    } else {
                      // Show smart pagination
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, currentPage + 2);
                      
                      // Adjust if we're near the beginning or end
                      if (currentPage <= 3) {
                        endPage = Math.min(5, totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        startPage = Math.max(1, totalPages - 4);
                      }
                      
                      // First page
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            className={`${styles.pageButton} ${currentPage === 1 ? styles.active : ''}`}
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <button key="ellipsis1" className={styles.pageButton} disabled>
                              ...
                            </button>
                          );
                        }
                      }
                      
                      // Middle pages
                      for (let i = startPage; i <= endPage; i++) {
                        if (i === 1 && startPage > 1) continue;
                        pages.push(
                          <button
                            key={i}
                            className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Last page
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <button key="ellipsis2" className={styles.pageButton} disabled>
                              ...
                            </button>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            className={`${styles.pageButton} ${currentPage === totalPages ? styles.active : ''}`}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        );
                      }
                    }
                    
                    return pages;
                  })()}
                </div>
                
                {/* Next Page */}
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  title="Next page"
                >
                  »
                </button>
                
                {/* Last Page */}
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </Section>
  );
};

export default OrdersPage;