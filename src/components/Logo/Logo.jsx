import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

const Logo = () => {
  return (
    <Link to="/" className={styles.logo}>
      <div className={styles.logoImage}>
        <img 
          src="/fixer.png" 
          alt="FixerUpper Logo" 
          className={styles.logoImg}
        />
      </div>
      <span className={styles.logoText}>
        <span className={styles.logoBlue}>fixer</span>
        <span className={styles.logoOrange}>Upper</span>
      </span>
    </Link>
  );
};

export default Logo;
