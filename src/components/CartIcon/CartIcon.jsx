import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { openCart } from '../../redux/cart/slice';
import { selectCartTotalItems, selectIsCartOpen } from '../../redux/cart/selectors';
import styles from './CartIcon.module.css';

const CartIcon = () => {
  const dispatch = useDispatch();
  const totalItems = useSelector(selectCartTotalItems);
  const isCartOpen = useSelector(selectIsCartOpen);

  const handleCartClick = () => {
    dispatch(openCart());
  };

  return (
    <motion.button
      className={styles.cartIcon}
      onClick={handleCartClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Відкрити кошик"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={styles.cartSvg}
      >
        <path 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6M17 18a2 2 0 100 4 2 2 0 000-4zM9 18a2 2 0 100 4 2 2 0 000-4z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {totalItems > 0 && (
        <motion.span
          className={styles.cartBadge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </motion.span>
      )}
    </motion.button>
  );
};

export default CartIcon;






