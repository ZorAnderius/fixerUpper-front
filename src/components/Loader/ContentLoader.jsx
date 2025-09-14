import Loader from './Loader';
import styles from './Loader.module.css';

const ContentLoader = ({ text = 'Loading content...', variant = 'dots' }) => {
  return (
    <div className={styles.contentLoader}>
      <Loader 
        size="lg" 
        variant={variant} 
        text={text}
      />
    </div>
  );
};

export default ContentLoader;
