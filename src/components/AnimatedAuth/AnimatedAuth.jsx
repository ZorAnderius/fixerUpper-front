import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../helpers/constants/routes';
import { logoutUser } from '../../redux/auth/operations';
import Link from '../Link/Link';
import Button from '../Button/Button';
import styles from './AnimatedAuth.module.css';

const AnimatedAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Debug logging
  // console.log('AnimatedAuth render:', { isAuthenticated, user, authState: useSelector(state => state.auth) });
  

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
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

  if (isAuthenticated && user) {
    return (
      <div className={styles.authContainer}>
        <Link 
          to={ROUTES.PROFILE}
          className={styles.userInfo}
        >
          <div className={styles.avatar}>
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={`${user.firstName || ''} ${user.lastName || ''}`}
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarInitials}>
                {getUserInitials()}
              </span>
            )}
          </div>
          <span className={styles.userName}>
            {user.firstName || user.email}
          </span>
        </Link>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          aria-label="Logout"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authButtons}>
        <Link 
          to={ROUTES.LOGIN} 
          variant="primary"
          size="md"
          className={`${styles.authButton} ${styles.loginButton}`}
        >
          LOG IN
        </Link>
        
        <Link 
          to={ROUTES.REGISTER} 
          variant="secondary"
          size="md"
          className={`${styles.authButton} ${styles.registerButton}`}
        >
          REGISTRATION
        </Link>
      </div>
    </div>
  );
};

export default AnimatedAuth;
