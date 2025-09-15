import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct } from '../../redux/products/operations';
import { selectCategories, selectProductStatuses, selectProductsLoading } from '../../redux/products/selectors';
import { fetchCategories, fetchProductStatuses } from '../../redux/products/operations';
import Button from '../Button/Button';
import styles from './ProductModal.module.css';

const ProductModal = ({ isOpen, onClose, product = null, mode = 'create' }) => {
  // console.log('ProductModal props:', { isOpen, product, mode });
  
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const productStatuses = useSelector(selectProductStatuses);
  const isLoading = useSelector(selectProductsLoading);
  
  // console.log('ProductModal data:', { categories, productStatuses, isLoading });
  // console.log('Categories details:', categories);
  // console.log('Statuses details:', productStatuses);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category_id: '',
    status_id: '',
    product_image: null
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  
  // console.log('Form data:', formData);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories());
      dispatch(fetchProductStatuses());
      setErrors({});
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        // console.log('Setting form data for edit mode:', product);
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price || '',
          quantity: product.quantity || '',
          category_id: product.category?.id || '',
          status_id: product.status?.id || '',
          product_image: null
        });
        setImagePreview(product.image_url || null);
      } else {
        setFormData({
          title: '',
          description: '',
          price: '',
          quantity: '',
          category_id: '',
          status_id: '',
          product_image: null
        });
        setImagePreview(null);
      }
    }
  }, [isOpen, mode, product]);

  // Additional useEffect to update form data when categories/statuses are loaded
  useEffect(() => {
    if (isOpen && mode === 'edit' && product && categories.length > 0 && productStatuses.length > 0) {
      // console.log('Updating form data after categories/statuses loaded:', product);
      setFormData(prev => ({
        ...prev,
        category_id: product.category?.id || '',
        status_id: product.status?.id || ''
      }));
    }
  }, [isOpen, mode, product, categories, productStatuses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        product_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must contain at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must contain at least 10 characters';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.status_id) {
      newErrors.status_id = 'Please select a status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        await dispatch(createProduct(formData)).unwrap();
      } else {
        // For update, only send changed fields
        const updateData = {};
        if (formData.title !== product.title) updateData.title = formData.title;
        if (formData.description !== product.description) updateData.description = formData.description;
        if (formData.price !== product.price) updateData.price = formData.price;
        if (formData.quantity !== product.quantity) updateData.quantity = formData.quantity;
        if (formData.category_id !== product.category?.id) updateData.category_id = formData.category_id;
        if (formData.status_id !== product.status?.id) updateData.status_id = formData.status_id;
        if (formData.product_image) updateData.product_image = formData.product_image;
        
        // console.log('Updating product with changed fields:', updateData);
        await dispatch(updateProduct({ id: product.id, productData: updateData })).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      quantity: '',
      category_id: '',
      status_id: '',
      product_image: null
    });
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  // console.log('ProductModal render - isOpen:', isOpen);
  
  if (!isOpen) return null;
  
  // console.log('ProductModal rendering with isOpen:', isOpen);
  
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
      
      {/* Modal */}
      <div
        data-testid="product-modal"
        className={styles.modal}
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000
        }}
      >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {mode === 'create' ? 'Create Product' : 'Edit Product'}
              </h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalContent}>
              <div className={styles.formGrid}>
                {/* Title */}
                <div className={styles.formGroup}>
                  <label htmlFor="title" className={styles.label}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    placeholder="Enter product title"
                  />
                  {errors.title && <span className={styles.error}>{errors.title}</span>}
                </div>

                {/* Price */}
                <div className={styles.formGroup}>
                  <label htmlFor="price" className={styles.label}>
                    Price (£) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.price && <span className={styles.error}>{errors.price}</span>}
                </div>

                {/* Quantity */}
                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.label}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.quantity ? styles.inputError : ''}`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.quantity && <span className={styles.error}>{errors.quantity}</span>}
                </div>

                {/* Category */}
                <div className={styles.formGroup}>
                  <label htmlFor="category_id" className={styles.label}>
                    Category *
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className={`${styles.select} ${errors.category_id ? styles.inputError : ''}`}
                  >
                    <option value="">Select category</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <span className={styles.error}>{errors.category_id}</span>}
                </div>

                {/* Status */}
                <div className={styles.formGroup}>
                  <label htmlFor="status_id" className={styles.label}>
                    Status *
                  </label>
                  <select
                    id="status_id"
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleInputChange}
                    className={`${styles.select} ${errors.status_id ? styles.inputError : ''}`}
                  >
                    <option value="">Select status</option>
                    {Array.isArray(productStatuses) && productStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  {errors.status_id && <span className={styles.error}>{errors.status_id}</span>}
                </div>

                {/* Description */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="description" className={styles.label}>
                    Product Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                    placeholder="Enter detailed product description"
                    rows="4"
                  />
                  {errors.description && <span className={styles.error}>{errors.description}</span>}
                </div>

                {/* Image Upload */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="product_image" className={styles.label}>
                    Product Image
                  </label>
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      id="product_image"
                      name="product_image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className={styles.fileInput}
                    />
                    <label htmlFor="product_image" className={styles.fileLabel}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Select image</span>
                    </label>
                  </div>
                  
                  {imagePreview && (
                    <div className={styles.imagePreview}>
                      <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {mode === 'create' ? 'Create' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </>
  );
};

export default ProductModal;



