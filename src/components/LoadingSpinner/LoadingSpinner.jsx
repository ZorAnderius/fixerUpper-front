import { motion } from 'framer-motion';
import { spinnerVariants, loadingVariants } from '../../helpers/animations/variants';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: styles.spinnerXs,
    sm: styles.spinnerSm,
    md: styles.spinnerMd,
    lg: styles.spinnerLg,
    xl: styles.spinnerXl,
  };

  const colorClasses = {
    primary: styles.spinnerPrimary,
    secondary: styles.spinnerSecondary,
    white: styles.spinnerWhite,
    gray: styles.spinnerGray,
  };

  const spinnerClass = `${styles.spinner} ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  if (fullScreen) {
    return (
      <motion.div
        className={styles.fullScreenOverlay}
        variants={loadingVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className={styles.fullScreenContent}>
          <motion.div
            className={spinnerClass}
            variants={spinnerVariants}
            animate="animate"
          />
          {text && <p className={styles.loadingText}>{text}</p>}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={spinnerClass}
        variants={spinnerVariants}
        animate="animate"
      />
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;








