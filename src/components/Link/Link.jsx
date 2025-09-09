import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import styles from './Link.module.css';

const Link = forwardRef(({
  children,
  to,
  variant = 'default',
  size = 'md',
  external = false,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const linkClasses = clsx(
    styles.link,
    styles[variant],
    styles[size],
    {
      [styles.fullWidth]: fullWidth,
    },
    className
  );

  if (external) {
    return (
      <a
        ref={ref}
        href={to}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        <span className={styles.externalIcon} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 3h6v6M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    );
  }

  return (
    <RouterLink
      ref={ref}
      to={to}
      className={linkClasses}
      {...props}
    >
      {children}
    </RouterLink>
  );
});

Link.displayName = 'Link';

export default Link;

