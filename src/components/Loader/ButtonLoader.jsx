import Loader from './Loader';
import styles from './Loader.module.css';

const ButtonLoader = ({ text = 'Loading...' }) => {
  return (
    <div className={styles.buttonLoader}>
      <Loader 
        size="sm" 
        variant="spinner" 
        text={text}
      />
    </div>
  );
};

export default ButtonLoader;
