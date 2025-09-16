import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchOrderById } from '../../redux/orders/operations';
import { selectCurrentOrder, selectOrdersLoading, selectOrdersError } from '../../redux/orders/selectors';
import { addToCart } from '../../redux/cart/operations';
import { ROUTES } from '../../helpers/constants/routes';
import Button from '../../components/Button/Button';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import styles from './OrderDetailPage.module.css';

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const isLoading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const [repeatLoading, setRepeatLoading] = useState(false);

  useEffect(() => {
    // console.log('OrderDetailPage mounted with orderId:', orderId);
    if (orderId) {
      // console.log('Fetching order with ID:', orderId);
      dispatch(fetchOrderById(orderId))
        .unwrap()
        .then((result) => {
          // console.log('Order fetched successfully:', result);
        })
        .catch((error) => {
          console.error('Failed to fetch order:', error);
          if (error.includes('404') || error.includes('Failed to fetch order: 404')) {
            // console.log('Order not found, redirecting to orders page');
            navigate(ROUTES.ORDERS);
          }
        });
    } else {
      // console.log('No orderId provided, redirecting to orders page');
      navigate(ROUTES.ORDERS);
    }
  }, [dispatch, orderId, navigate]);

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

  const handleRepeatOrder = async () => {
    if (!order?.orderItems) return;
    
    setRepeatLoading(true);
    let addedItems = 0;
    let failedItems = [];
    
    try {
      // Add all items from the order to cart
      for (const item of order.orderItems) {
        if (item.products && item.quantity > 0) {
          try {
            await dispatch(addToCart({
              productId: item.products.id,
              quantity: item.quantity
            }));
            addedItems++;
          } catch (itemError) {
            console.error(`Failed to add item ${item.products.title}:`, itemError);
            failedItems.push(item.products.title || 'Unknown product');
          }
        }
      }
      
      // Navigate to cart page if at least one item was added
      if (addedItems > 0) {
        navigate(ROUTES.CART);
      } else {
      }
      
      // Show warning if some items failed
      if (failedItems.length > 0 && addedItems > 0) {
      }
    } catch (error) {
      console.error('Failed to repeat order:', error);
    } finally {
      setRepeatLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`${ROUTES.PRODUCTS}/${productId}`);
    }
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

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading order details...</p>
          </div>
        </Container>
      </Section>
    );
  }

  if (error || !order) {
    return (
      <Section>
        <Container>
          <div className={styles.errorContainer}>
            <h2>Order Not Found</h2>
            <p>The order you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate(ROUTES.ORDERS)}
            >
              Back to Orders
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
          className={styles.orderDetailPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className={styles.pageHeader}>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.ORDERS)}
              className={styles.backButton}
            >
              ← Back to Orders
            </Button>
            <h1 className={styles.pageTitle}>
              Order #{order.order_number || order.id?.slice(-8)}
            </h1>
            <div className={styles.orderStatus}>
              <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Order Date:</span>
                  <span>{formatDate(order.createdAt || order.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className={styles.orderItems}>
            <h3>Order Items</h3>
            <div className={styles.itemsList}>
              {order.orderItems?.map((item, index) => (
                <motion.div
                  key={index}
                  className={styles.itemCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={styles.itemImage}>
                    {item.products?.image_url ? (
                      <img 
                        src={item.products.image_url} 
                        alt={item.products.title || 'Product'}
                        className={styles.productImg}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.itemInfo}>
                    <h4 
                      className={styles.itemTitle}
                      onClick={() => handleProductClick(item.products?.id)}
                      style={{ 
                        cursor: 'pointer',
                        color: 'var(--color-primary-orange)',
                        textDecoration: 'underline'
                      }}
                    >
                      {item.products?.title || 'Unknown Product'}
                    </h4>
                    {item.products?.description && (
                      <p className={styles.itemDescription}>
                        {item.products.description}
                      </p>
                    )}
                    <div className={styles.itemDetails}>
                      <span className={styles.itemQuantity}>
                        Quantity: {item.quantity}
                      </span>
                      <div className={styles.itemPrices}>
                        <span className={styles.itemPricePerUnit}>
                          {formatPrice((item.price || 0) / item.quantity)} each
                        </span>
                        <span className={styles.itemTotalPrice}>
                          {formatPrice(item.price || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className={styles.totalSummary}>
            <div className={styles.totalCard}>
              <div className={styles.totalRow}>
                <span>Items Total:</span>
                <span>{order.orderItems?.length || 0} items</span>
              </div>
              <div className={styles.totalRow}>
                <span>Order Total:</span>
                <span className={styles.finalTotal}>
                  {formatPrice(order.total_price || order.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actionsSection}>
            <Button
              variant="primary"
              onClick={handleRepeatOrder}
              loading={repeatLoading}
              className={styles.repeatOrderButton}
            >
              Repeat Order
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default OrderDetailPage;