import { motion } from 'framer-motion';
import { cardVariants } from '../../helpers/animations/variants';
import styles from './AnimatedCard.module.css';

const AnimatedCard = ({ 
  children, 
  className = '', 
  hover = true, 
  clickable = false,
  delay = 0,
  onClick,
  ...props 
}) => {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`${styles.card} ${clickable ? styles.clickable : ''} ${className}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : undefined}
      whileTap={clickable ? "tap" : undefined}
      transition={{ delay }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;



