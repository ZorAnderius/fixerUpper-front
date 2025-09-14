import styles from './Loader.module.css';

const Loader = ({ 
  size = 'md', 
  variant = 'spinner', 
  text = '', 
  className = '' 
}) => {
  const containerClasses = `${styles.container} ${styles[`size--${size}`]} ${className}`;
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        );
      case 'pulse':
        return <div className={styles.pulse}></div>;
      case 'ring':
        return <div className={styles.ring}></div>;
      case 'bars':
        return (
          <div className={styles.bars}>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
          </div>
        );
      case 'spinner':
      default:
        return <div className={styles.spinner}></div>;
    }
  };

  return (
    <div className={containerClasses}>
      <div className={styles.loader}>
        {renderLoader()}
      </div>
      {text && <div className={styles.text}>{text}</div>}
    </div>
  );
};

export default Loader;
