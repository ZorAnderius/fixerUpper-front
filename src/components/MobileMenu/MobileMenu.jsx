import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '../../helpers/constants/routes';
import { logoutUser } from '../../redux/auth/operations';
import Button from '../Button/Button';
import Link from '../Link/Link';
import styles from './MobileMenu.module.css';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const toggleMenu = () => {
    // Don't open menu on desktop
    if (window.innerWidth >= 768) {
      return;
    }
    
    if (!isOpen) {
      // Opening menu
      setIsOpen(true);
      // Start animation after DOM update
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      // Closing menu
      setIsAnimating(false);
      // Close after animation
      setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const closeMenu = () => {
    setIsAnimating(false);
    // Close after animation
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // Block scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Add no-scroll class to body and html
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    } else {
      // Remove no-scroll class
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    };
  }, [isOpen]);

  // Close menu on desktop screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      closeMenu();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      closeMenu();
      navigate(ROUTES.LOGIN);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (lastName) {
      return lastName[0].toUpperCase();
    }
    
    return 'U';
  };

  return (
    <>
      <div className={styles.mobileMenu}>
        <button 
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </span>
        </button>
      </div>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.menuOverlay}
          onClick={closeMenu}
        >
          <nav 
            className={`${styles.mobileNav} ${isAnimating ? styles.mobileNavOpen : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className={styles.closeButton}
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <ul className={styles.mobileNavList}>
            <li className={styles.mobileNavItem}>
              <NavLink 
                to={ROUTES.MAIN} 
                className={({ isActive }) => 
                  `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                }
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
          </ul>
          
          <div className={styles.mobileAuthSection}>
            {isAuthenticated && user ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileAvatar}>
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${user.firstName || ''} ${user.lastName || ''}`}
                        className={styles.mobileAvatarImage}
                      />
                    ) : (
                      <span className={styles.mobileAvatarInitials}>
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className={styles.mobileUserName}>
                    {user.firstName || user.email}
                  </span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="danger"
                  size="md"
                  fullWidth
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to={ROUTES.LOGIN} 
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={closeMenu}
                >
                  LOG IN
                </Link>
                <Link 
                  to={ROUTES.REGISTER} 
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={closeMenu}
                >
                  REGISTRATION
                </Link>
              </>
            )}
          </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileMenu;