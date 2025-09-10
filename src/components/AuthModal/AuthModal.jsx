import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { transferPendingCartToCart } from '../../redux/pending/operations';
import { selectPreviousLocation, selectHasPendingItems } from '../../redux/pending/selectors';
import Button from '../Button/Button';
import { ROUTES } from '../../helpers/constants/routes';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose, title = "Authorization Required", message = "To add items to your cart, you need to log in or register." }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const previousLocation = useSelector(selectPreviousLocation);
  const hasPendingItems = useSelector(selectHasPendingItems);

  console.log('AuthModal - previousLocation:', previousLocation);
  console.log('AuthModal - hasPendingItems:', hasPendingItems);

  const handleLoginClick = () => {
    onClose();
    console.log('AuthModal handleLoginClick - previousLocation:', previousLocation);
    console.log('AuthModal handleLoginClick - hasPendingItems:', hasPendingItems);
    
    // Зберігаємо поточну сторінку як попередню для редиректу після логіну
    if (previousLocation) {
      console.log('Navigating to LOGIN with from:', previousLocation);
      navigate(ROUTES.LOGIN, { state: { from: previousLocation, hasPendingItems } });
    } else {
      console.log('Navigating to LOGIN without from (using default)');
      navigate(ROUTES.LOGIN, { state: { hasPendingItems } });
    }
  };

  const handleRegisterClick = () => {
    onClose();
    // Зберігаємо поточну сторінку як попередню для редиректу після реєстрації
    if (previousLocation) {
      navigate(ROUTES.REGISTER, { state: { from: previousLocation, hasPendingItems } });
    } else {
      navigate(ROUTES.REGISTER, { state: { hasPendingItems } });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.authModalOverlay}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.authModal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h3>{title}</h3>
            <p>{message}</p>
            <div className={styles.authModalActions}>
              <Button
                variant="primary"
                onClick={handleLoginClick}
                size="sm"
              >
                🔑 Log In
              </Button>
              <Button
                variant="secondary"
                onClick={handleRegisterClick}
                size="sm"
              >
                📝 Register
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                size="sm"
              >
                ❌ Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;