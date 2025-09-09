import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../redux/auth/slice';
import { setAccessToken } from '../../api/authServices';
import Button from '../Button/Button';
import styles from './UserProfile.module.css';

const UserProfile = () => {
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

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.avatar}>
          <span className={styles.avatarInitials}>U</span>
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.userName}>Guest User</span>
          <span className={styles.userRole}>Visitor</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
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
        {/* Notification dot */}
        <div className={styles.notificationDot}></div>
      </div>
      <div className={styles.profileInfo}>
        <span className={styles.userName}>
          {user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email
          }
        </span>
        <span className={styles.userRole}>
          {user.role || 'Customer'}
        </span>
      </div>
    </div>
  );
};

export default UserProfile;


