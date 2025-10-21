import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { selectIsAdmin } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import Icon from '../Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import styles from './AdminNav.module.css';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(state => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const adminLinks = [
    {
      path: ROUTES.ADMIN,
      label: 'Admin Panel',
      icon: ICONS.SETTINGS
    },
    {
      path: ROUTES.ADMIN_ADD_PRODUCT,
      label: 'Add Product',
      icon: ICONS.PLUS
    }
  ];

  const handleLinkClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={styles.adminNav}>
      <button
        className={`${styles.adminToggle} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Admin navigation"
      >
        <Icon name={ICONS.SETTINGS} size={ICON_SIZES.SM} />
        <span className={styles.adminLabel}>Admin</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon name={ICONS.CHEVRON} size={ICON_SIZES.XS} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.adminDropdown}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {adminLinks.map((link) => (
              <button
                key={link.path}
                className={`${styles.adminLink} ${isActive(link.path) ? styles.active : ''}`}
                onClick={() => handleLinkClick(link.path)}
              >
                <Icon name={link.icon} size={ICON_SIZES.XS} />
                <span>{link.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNav;


