import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button';
import { ROUTES } from '../../helpers/constants/routes';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose, title = "Authorization Required", message = "To add items to your cart, you need to log in or register." }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onClose();
    navigate(ROUTES.LOGIN);
  };

  const handleRegisterClick = () => {
    onClose();
    navigate(ROUTES.REGISTER);
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