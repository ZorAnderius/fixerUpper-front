import clsx from 'clsx';
import styles from './Icon.module.css';

const Icon = ({ 
  name, 
  size = 'md', 
  className = '', 
  color = 'currentColor',
  ...props 
}) => {
  const iconClasses = clsx(
    styles.icon,
    styles[`icon--${size}`],
    className
  );

  return (
    <svg 
      className={iconClasses}
      style={{ color }}
      {...props}
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
};

export default Icon;






