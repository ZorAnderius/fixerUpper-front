import { useMemo } from 'react';
import { sanitizeHTML } from '../../helpers/security/sanitize';
import styles from './SafeHTML.module.css';

const SafeHTML = ({ 
  content, 
  allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
  allowedAttributes = ['href', 'title', 'target'],
  className = '',
  ...props 
}) => {
  const sanitizedContent = useMemo(() => {
    if (!content || typeof content !== 'string') {
      return '';
    }

    return sanitizeHTML(content, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      KEEP_CONTENT: true,
    });
  }, [content, allowedTags, allowedAttributes]);

  if (!sanitizedContent) {
    return null;
  }

  return (
    <div 
      className={`${styles.safeHTML} ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
};

export default SafeHTML;















