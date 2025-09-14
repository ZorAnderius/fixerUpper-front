import Loader from './Loader';
import styles from './Loader.module.css';

const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className={styles.pageLoader}>
      <div className={styles.container}>
        <Loader 
          size="lg" 
          variant="spinner" 
          text={text}
        />
      </div>
    </div>
  );
};

export default PageLoader;
