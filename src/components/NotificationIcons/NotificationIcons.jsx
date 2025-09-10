import { useState } from 'react';
import styles from './NotificationIcons.module.css';

const NotificationIcons = () => {
  const [notifications, setNotifications] = useState({
    bell: 3,
    envelope: 1
  });

  const handleNotificationClick = (type) => {
    console.log(`${type} notification clicked`);
    // TODO: Implement notification handling
  };

  return (
    <div className={styles.notificationContainer}>
      {/* Bell Icon */}
      <button 
        className={styles.notificationButton}
        onClick={() => handleNotificationClick('bell')}
        aria-label="Notifications"
      >
        <svg
          className={styles.notificationIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {notifications.bell > 0 && (
          <span className={styles.notificationBadge}>
            {notifications.bell > 9 ? '9+' : notifications.bell}
          </span>
        )}
      </button>

      {/* Envelope Icon */}
      <button 
        className={styles.notificationButton}
        onClick={() => handleNotificationClick('envelope')}
        aria-label="Messages"
      >
        <svg
          className={styles.notificationIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="22,6 12,13 2,6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {notifications.envelope > 0 && (
          <span className={styles.notificationBadge}>
            {notifications.envelope > 9 ? '9+' : notifications.envelope}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationIcons;





