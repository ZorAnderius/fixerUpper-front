import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../helpers/constants/routes';
import styles from './Navigation.module.css';

const Navigation = () => {
  return (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <NavLink 
            to={ROUTES.PRODUCTS} 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Catalog
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;