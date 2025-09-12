import { motion, AnimatePresence } from 'framer-motion';
import { notificationVariants } from '../../helpers/animations/variants';
import Icon from '../Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import styles from './AnimatedNotification.module.css';

const AnimatedNotification = ({ 
  isVisible, 
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  onClose,
  className = '' 
}) => {
  const typeConfig = {
    success: {
      icon: 'check',
      color: 'success',
      bgColor: 'bgSuccess',
    },
    error: {
      icon: 'warning',
      color: 'error',
      bgColor: 'bgError',
    },
    warning: {
      icon: 'warning',
      color: 'warning',
      bgColor: 'bgWarning',
    },
    info: {
      icon: 'info',
      color: 'info',
      bgColor: 'bgInfo',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${styles.notification} ${styles[config.bgColor]} ${className}`}
          variants={notificationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
        >
          <div className={styles.notificationContent}>
            <div className={styles.iconContainer}>
              <Icon 
                name={config.icon} 
                size={ICON_SIZES.MD} 
                className={styles[config.color]}
              />
            </div>
            
            <div className={styles.textContent}>
              {title && <h4 className={styles.title}>{title}</h4>}
              {message && <p className={styles.message}>{message}</p>}
            </div>
            
            {onClose && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close notification"
              >
                <Icon name="close" size={ICON_SIZES.SM} />
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className={styles.progressBar}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedNotification;







