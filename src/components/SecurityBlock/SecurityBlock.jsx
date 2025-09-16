import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectIsAdmin } from '../../redux/auth/selectors';
import Icon from '../Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import styles from './SecurityBlock.module.css';

const SecurityBlock = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const [securityStats, setSecurityStats] = useState({
    xssAttempts: 0,
    validationErrors: 0,
    suspiciousActivity: 0,
    lastSecurityScan: new Date().toISOString()
  });

  // Mock security data - in real app, this would come from API
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityStats(prev => ({
        ...prev,
        xssAttempts: prev.xssAttempts + Math.floor(Math.random() * 3),
        validationErrors: prev.validationErrors + Math.floor(Math.random() * 5),
        suspiciousActivity: prev.suspiciousActivity + Math.floor(Math.random() * 2)
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return null;
  }

  const securityItems = [
    {
      title: 'XSS Protection',
      description: 'Cross-site scripting protection enabled',
      status: 'active',
      icon: ICONS.SHIELD,
      color: 'green'
    },
    {
      title: 'Input Validation',
      description: 'Joi validation schemas active',
      status: 'active',
      icon: ICONS.CHECK,
      color: 'green'
    },
    {
      title: 'Sanitization',
      description: 'DOMPurify sanitization enabled',
      status: 'active',
      icon: ICONS.CLEAN,
      color: 'green'
    },
    {
      title: 'CSRF Protection',
      description: 'Cross-site request forgery protection',
      status: 'active',
      icon: ICONS.LOCK,
      color: 'green'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Icon name={ICONS.CHECK_CIRCLE} size={ICON_SIZES.SM} />;
      case 'warning':
        return <Icon name={ICONS.EXCLAMATION_TRIANGLE} size={ICON_SIZES.SM} />;
      case 'error':
        return <Icon name={ICONS.X_CIRCLE} size={ICON_SIZES.SM} />;
      default:
        return <Icon name={ICONS.CLOCK} size={ICON_SIZES.SM} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'warning':
        return styles.statusWarning;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusPending;
    }
  };

  return (
    <motion.div
      className={styles.securityBlock}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Icon name={ICONS.SHIELD} size={ICON_SIZES.LG} />
          <h3 className={styles.title}>Security Dashboard</h3>
        </div>
        <div className={styles.lastUpdate}>
          Last scan: {new Date(securityStats.lastSecurityScan).toLocaleTimeString()}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Icon name={ICONS.SHIELD} size={ICON_SIZES.MD} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{securityStats.xssAttempts}</div>
            <div className={styles.statLabel}>XSS Attempts Blocked</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Icon name={ICONS.EXCLAMATION_TRIANGLE} size={ICON_SIZES.MD} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{securityStats.validationErrors}</div>
            <div className={styles.statLabel}>Validation Errors</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Icon name={ICONS.EYE} size={ICON_SIZES.MD} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{securityStats.suspiciousActivity}</div>
            <div className={styles.statLabel}>Suspicious Activities</div>
          </div>
        </div>
      </div>

      <div className={styles.securityFeatures}>
        <h4 className={styles.featuresTitle}>Security Features Status</h4>
        <div className={styles.featuresList}>
          {securityItems.map((item, index) => (
            <motion.div
              key={item.title}
              className={styles.featureItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={styles.featureIcon}>
                <Icon name={item.icon} size={ICON_SIZES.SM} />
              </div>
              <div className={styles.featureContent}>
                <div className={styles.featureTitle}>{item.title}</div>
                <div className={styles.featureDescription}>{item.description}</div>
              </div>
              <div className={`${styles.featureStatus} ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.securityActions}>
        <button className={styles.actionButton}>
          <Icon name={ICONS.REFRESH} size={ICON_SIZES.SM} />
          Run Security Scan
        </button>
        <button className={styles.actionButton}>
          <Icon name={ICONS.SETTINGS} size={ICON_SIZES.SM} />
          Security Settings
        </button>
      </div>
    </motion.div>
  );
};

export default SecurityBlock;
