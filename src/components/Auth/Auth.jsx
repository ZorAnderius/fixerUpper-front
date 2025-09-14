import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '../../helpers/constants/routes';
import { clearAuth } from '../../redux/auth/slice';
import { setAccessToken } from '../../api/authServices';
import Button from '../Button/Button';
import Link from '../Link/Link';
import styles from './Auth.module.css';

const Auth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const handleLogout = () => {
    setAccessToken(null);
    dispatch(clearAuth());
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
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
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
        </div>
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
      <Link 
        to={ROUTES.LOGIN} 
        variant="ghost"
        size="sm"
      >
        Login
      </Link>
      <Link 
        to={ROUTES.REGISTER} 
        variant="primary"
        size="sm"
      >
        Register
      </Link>
    </div>
  );
};

export default Auth;
