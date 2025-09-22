import { useMemo } from 'react';
import { sanitizeHTML, sanitizeText } from '../../helpers/security/sanitize';
import styles from './UserContent.module.css';

const UserContent = ({ 
  content, 
  type = 'text', // 'text', 'html', 'markdown'
  maxLength = 1000,
  allowHTML = false,
  className = '',
  ...props 
}) => {
  const sanitizedContent = useMemo(() => {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Truncate if too long
    let processedContent = content;
    if (processedContent.length > maxLength) {
      processedContent = processedContent.substring(0, maxLength) + '...';
    }

    switch (type) {
      case 'html':
        if (allowHTML) {
          return sanitizeHTML(processedContent, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: [],
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            SANITIZE_DOM: true,
            KEEP_CONTENT: true,
          });
        }
        return sanitizeText(processedContent);
      
      case 'markdown':
        // Basic markdown sanitization (convert to safe HTML)
        const markdownToHTML = processedContent
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br>');
        
        return sanitizeHTML(markdownToHTML, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i'],
          ALLOWED_ATTR: [],
          ALLOW_DATA_ATTR: false,
          ALLOW_UNKNOWN_PROTOCOLS: false,
          SANITIZE_DOM: true,
          KEEP_CONTENT: true,
        });
      
      case 'text':
      default:
        return sanitizeText(processedContent);
    }
  }, [content, type, maxLength, allowHTML]);

  if (!sanitizedContent) {
    return null;
  }

  if (type === 'html' && allowHTML) {
    return (
      <div 
        className={`${styles.userContent} ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        {...props}
      />
    );
  }

  return (
    <div className={`${styles.userContent} ${className}`} {...props}>
      {sanitizedContent}
    </div>
  );
};

export default UserContent;















