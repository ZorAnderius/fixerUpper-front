import Loader from './Loader';
import styles from './Loader.module.css';

const InlineLoader = ({ text = 'Loading...', variant = 'dots' }) => {
  return (
    <div className={styles.inlineLoader}>
      <Loader 
        size="sm" 
        variant={variant} 
        text={text}
      />
    </div>
  );
};

export default InlineLoader;
