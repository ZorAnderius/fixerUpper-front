import { useState, useRef, useCallback } from 'react';
import { validateFileUpload } from '../../helpers/security/validation';
import { INPUT_LIMITS } from '../../helpers/security/headers';
import Icon from '../Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import styles from './SecureFileUpload.module.css';

const SecureFileUpload = ({
  onFileSelect,
  onError,
  accept = INPUT_LIMITS.ALLOWED_FILE_TYPES.join(','),
  maxSize = INPUT_LIMITS.MAX_FILE_SIZE,
  maxFiles = 1,
  className = '',
  disabled = false,
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFiles = useCallback((fileList) => {
    const newErrors = [];
    const validFiles = [];

    // Check number of files
    if (fileList.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} file(s) allowed`);
      return { validFiles: [], errors: newErrors };
    }

    Array.from(fileList).forEach((file, index) => {
      const validation = validateFileUpload(file, INPUT_LIMITS.ALLOWED_FILE_TYPES, maxSize);
      
      if (!validation.isValid) {
        newErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, errors: newErrors };
  }, [maxFiles, maxSize]);

  const handleFileSelect = useCallback((selectedFiles) => {
    const { validFiles, errors: validationErrors } = validateFiles(selectedFiles);
    
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      onError?.(validationErrors);
      return;
    }

    setFiles(validFiles);
    onFileSelect?.(validFiles);
  }, [validateFiles, onFileSelect, onError]);

  const handleInputChange = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect?.(newFiles);
  }, [files, onFileSelect]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`${styles.secureFileUpload} ${className}`}>
      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          disabled={disabled}
          className={styles.hiddenInput}
          {...props}
        />
        
        <div className={styles.dropZoneContent}>
          <Icon name={ICONS.UPLOAD || 'chevron'} size={ICON_SIZES.XL} />
          <p className={styles.dropZoneText}>
            {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className={styles.dropZoneSubtext}>
            Max {maxFiles} file(s), up to {formatFileSize(maxSize)} each
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className={styles.errorContainer}>
          {errors.map((error, index) => (
            <div key={index} className={styles.errorMessage}>
              <Icon name="warning" size={ICON_SIZES.SM} />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <Icon name="file" size={ICON_SIZES.SM} />
                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className={styles.removeButton}
                disabled={disabled}
              >
                <Icon name="close" size={ICON_SIZES.SM} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecureFileUpload;














