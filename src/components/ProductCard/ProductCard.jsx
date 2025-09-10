import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cart/operations';
import { selectCartItemById } from '../../redux/cart/selectors';
import { selectIsAuthenticated } from '../../redux/auth/selectors';
import { addToPendingCartAndShowAuth } from '../../redux/pending/operations';
import { setPreviousLocation, setRedirectReason } from '../../redux/pending/slice';
import { usePreviousLocation } from '../../hooks/usePreviousLocation';
import { ROUTES } from '../../helpers/constants/routes';
import { cardVariants } from '../../helpers/animations/variants';
import { useHoverAnimation } from '../../hooks/useAnimation';
import Button from '../Button/Button';
import AnimatedCard from '../AnimatedCard/AnimatedCard';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, index = 0, onAuthRequired }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const cartItem = useSelector(selectCartItemById(product.id));
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverAnimation();
  const { previousLocation } = usePreviousLocation();

  // Debug logging
  console.log('ProductCard render - product:', product);
  console.log('ProductCard render - product.image_url:', product.image_url);
  console.log('ProductCard render - product.title:', product.title);
  console.log('ProductCard render - product.quantity:', product.quantity);
  console.log('ProductCard render - cartItem:', cartItem);
  console.log('ProductCard render - isLoading:', isLoading);
  console.log('ProductCard render - isAuthenticated:', isAuthenticated);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    console.log('handleAddToCart called, isAuthenticated:', isAuthenticated);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, saving state and showing auth modal');
      console.log('Current location.pathname:', location.pathname);
      
      // Зберігаємо поточну сторінку
      dispatch(setPreviousLocation(location.pathname));
      console.log('Dispatched setPreviousLocation with:', location.pathname);
      
      // Додаємо товар в pending кошик та показуємо модальку
      dispatch(addToPendingCartAndShowAuth({
        productId: product.id,
        quantity: 1,
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
    
    console.log('User authenticated, adding to cart');
    setIsLoading(true);
    
    try {
      await dispatch(addToCart({ 
        productId: product.id, 
        quantity: 1 
      })).unwrap();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`${ROUTES.PRODUCTS}/${product.id}`);
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
    <AnimatedCard
      className={styles.productCard}
      onClick={handleCardClick}
      hover={true}
      clickable={true}
      delay={index * 0.1}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.productImage}>
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.title}
            className={styles.productImageImg}
          />
        ) : (
          <div className={styles.productImagePlaceholder}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        
                {product.quantity === 0 && (
                  <div className={styles.outOfStock}>
                    <span>Out of Stock</span>
                  </div>
                )}
      </div>
      
      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.title}</h3>
        <p className={styles.productDescription}>
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description
          }
        </p>
        
        <div className={styles.productPrice}>
          {formatPrice(product.price)}
        </div>
        
        <div className={styles.productActions}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || isLoading}
            loading={isLoading}
            fullWidth
          >
            {cartItem ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>

    </AnimatedCard>
  );
};

export default ProductCard;
