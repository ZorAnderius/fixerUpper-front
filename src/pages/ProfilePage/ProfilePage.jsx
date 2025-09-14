import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAllOrders } from '../../redux/orders/operations';
import { logoutUser } from '../../redux/auth/operations';
import { openOrderModal } from '../../redux/orders/slice';
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
import { selectUser } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../../components/Button/Button';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const orders = useSelector(selectOrders);
  const isLoading = useSelector(selectOrdersLoading);
  const ordersError = useSelector(selectOrdersError);
  const currentPage = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);
  const hasNextPage = useSelector(selectHasNextPage);
  const hasPreviousPage = useSelector(selectHasPreviousPage);
  const totalItems = useSelector(selectTotalItems);

  const handlePageChange = (newPage) => {
    dispatch(fetchAllOrders({ page: newPage, limit: 5 }));
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchAllOrders({ page: 1, limit: 5 }))
        .unwrap()
        .catch((error) => {
          console.error('Failed to fetch orders:', error);
          // If it's an auth error, redirect to login
          if (error.includes('401') || error.includes('Unauthorized')) {
            navigate(ROUTES.LOGIN);
          }
        });
    }
  }, [dispatch, user, navigate]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
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

  // Remove showAllOrders logic - now using pagination

  if (!user) {
    return (
      <Section>
        <Container>
          <div className={styles.notAuthenticated}>
            <h2>Authentication Required</h2>
            <p>Please log in to view your profile</p>
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

  return (
    <Section>
      <Container>
        <motion.div
          className={styles.profilePage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Page Title */}
          <div className={styles.pageTitle}>
            <h1>PROFILE</h1>
            <p>Manage your orders and account settings</p>
          </div>

          <div className={styles.profileLayout}>
            {/* Left Panel - User Info */}
            <div className={styles.userPanel}>
              <div className={styles.userCard}>
                <div className={styles.avatar}>
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className={styles.avatarImg}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                  )}
                  <div className={styles.avatarEdit}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className={styles.userName}>
                  {user.firstName?.toUpperCase() || 'USER'}
                </h2>
                
                <p className={styles.userEmail}>
                  Email: {user.email}
                </p>
                
                <div className={styles.userStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{orders.length}</span>
                    <span className={styles.statLabel}>Orders</span>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  className={styles.logoutButton}
                  onClick={async () => {
                    try {
                      await dispatch(logoutUser()).unwrap();
                      navigate(ROUTES.LOGIN);
                    } catch (error) {
                      console.error('Logout failed:', error);
                      // Even if logout fails, redirect to login
                      navigate(ROUTES.LOGIN);
                    }
                  }}
                >
                  LOG OUT
                </Button>
              </div>
            </div>

            {/* Right Panel - Orders */}
            <div className={styles.ordersPanel}>
              <div className={styles.tabHeader}>
                <div className={`${styles.tab} ${styles.activeTab}`}>
                  ORDERS
                </div>
              </div>

              <div className={styles.ordersContent}>
                {isLoading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className={styles.emptyOrders}>
                    <div className={styles.emptyOrdersIcon}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>No Orders Yet</h3>
                    <p>You haven't made any orders yet</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate(ROUTES.PRODUCTS)}
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        className={styles.orderCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        {/* Order Number - Overlapping Effect */}
                        <div className={styles.orderTitleContainer}>
                          <h3 className={styles.orderTitle}>
                            Order #{order.order_number || order.id?.slice(-8)}
                          </h3>
                        </div>

                        <div className={styles.orderContent}>
                          {/* Products Section */}
                          <div className={styles.productsSection}>
                            {order.orderItems && order.orderItems.length > 0 ? (
                              <div className={styles.productsGrid}>
                                {order.orderItems.map((item, itemIndex) => (
                                  <div key={itemIndex} className={styles.productItem}>
                                    <div className={styles.productImage}>
                                      {item.products?.image_url ? (
                                        <img 
                                          src={item.products.image_url} 
                                          alt={item.products.title || 'Product'}
                                          className={styles.orderImg}
                                        />
                                      ) : (
                                        <div className={styles.orderImgPlaceholder}>
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <div className={styles.quantityBadge}>
                                      {item.quantity}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.orderImgPlaceholder}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Order Info Section */}
                          <div className={styles.orderInfo}>
                            <p className={styles.orderDescription}>
                              {order.orderItems?.length || 0} items • {formatDate(order.createdAt || order.created_at)}
                            </p>
                            <p className={styles.orderPrice}>
                              {formatPrice(order.total_price || order.totalAmount || 0)}
                            </p>
                          </div>
                          
                          {/* View Button */}
                          <div className={styles.orderActions}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // console.log('Order data:', order);
                                // console.log('Order ID:', order.id);
                                // console.log('Order number:', order.order_number);
                                const orderId = order.id || order.order_number || order.order_id;
                                // console.log('Using order ID:', orderId);
                                if (orderId) {
                                  navigate(`${ROUTES.ORDERS}/${orderId}`);
                                } else {
                                  console.error('No order ID found');
                                  alert('Order ID not found');
                                }
                              }}
                              className={styles.viewButton}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Showing {orders.length} of {totalItems} orders
                    </div>
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
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default ProfilePage;
