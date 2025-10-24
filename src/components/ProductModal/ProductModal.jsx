import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, fetchProductById, fetchAllProducts } from '../../redux/products/operations';
import { selectCategories, selectProductStatuses, selectProductsLoading } from '../../redux/products/selectors';
import { fetchCategories, fetchProductStatuses } from '../../redux/products/operations';
import { productSchema, validateAndSanitize } from '../../utils/validation';
import { sanitizeInput } from '../../utils/security';
import Button from '../Button/Button';
import styles from './ProductModal.module.css';

const ProductModal = ({ isOpen, onClose, productId = null, mode = 'create' }) => {

  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const productStatuses = useSelector(selectProductStatuses);
  const isLoading = useSelector(selectProductsLoading);


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

  // Local state for the product being edited
  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);



  useEffect(() => {
    if (isOpen) {
      // Load categories and product statuses when modal opens
      dispatch(fetchCategories());
      dispatch(fetchProductStatuses());
      setErrors({});

      // Load product data if in edit mode
      if (mode === 'edit' && productId) {
        loadProductData();
      }
    }
  }, [isOpen, dispatch, mode, productId]);

  // Function to load product data
  const loadProductData = async () => {
    if (!productId) {
      return;
    }

    setIsLoadingProduct(true);
    try {
      const result = await dispatch(fetchProductById(productId)).unwrap();
      setProduct(result);
    } catch (error) {
      console.error('Failed to load product:', error);
      setErrors({ general: 'Failed to load product data' });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product && product?.title) {
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
      } else if (mode === 'create') {
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
    if (errors?.[name]) {
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


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if product is loaded for edit mode
    if (mode === 'edit' && (!productId || !product)) {
      console.error('❌ Cannot save: Product not loaded');
      setErrors({ general: 'Product not loaded. Please try again.' });
      return;
    }

    // Validate form data using Joi schema
    const validationResult = validateAndSanitize(formData, productSchema);

    if (!validationResult.isValid) {
      // Convert validation errors to the format expected by the form
      const formattedErrors = {};
      validationResult.errors.forEach(error => {
        formattedErrors[error.field] = error.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      // Sanitize input data
      const sanitizedData = {
        title: sanitizeInput(formData.title, 100),
        description: sanitizeInput(formData.description, 1000),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category_id: formData.category_id,
        status_id: formData.status_id,
        product_image: formData.product_image
      };

      if (mode === 'create') {
        console.log('💾 Creating new product:', sanitizedData);
        const result = await dispatch(createProduct(sanitizedData)).unwrap();
        console.log('✅ Product created successfully:', result);
      } else {
        // For update, send ALL fields (backend expects complete object)
        const updateData = {
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.price,
          quantity: sanitizedData.quantity,
          category_id: sanitizedData.category_id,
          status_id: sanitizedData.status_id,
          product_image: sanitizedData.product_image
        };

        if (!productId) {
          throw new Error('Product ID is missing');
        }
        const result = await dispatch(updateProduct({ id: productId, productData: updateData })).unwrap();
        
        // Update product list after successful update
        dispatch(fetchAllProducts());
      }
      
      // Close modal only after successful save
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      // Set general error
      setErrors({ general: error.message || 'Failed to save product' });
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


  if (!isOpen) return null;
  
  // If edit mode but product not loaded, show loading
  if (mode === 'edit' && (isLoadingProduct || !product)) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }



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
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                value={formData.title || ''}
                onChange={handleInputChange}
                className={`${styles.input} ${errors?.title ? styles.inputError : ''}`}
                placeholder="Enter product title"
              />
              {errors?.title && <span className={styles.error}>{errors.title}</span>}
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
                className={`${styles.input} ${errors?.price ? styles.inputError : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors?.price && <span className={styles.error}>{errors.price}</span>}
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
                className={`${styles.input} ${errors?.quantity ? styles.inputError : ''}`}
                placeholder="0"
                min="0"
              />
              {errors?.quantity && <span className={styles.error}>{errors.quantity}</span>}
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
                className={`${styles.select} ${errors?.category_id ? styles.inputError : ''}`}
              >
                <option value="">Select category</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors?.category_id && <span className={styles.error}>{errors.category_id}</span>}
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
                className={`${styles.select} ${errors?.status_id ? styles.inputError : ''}`}
              >
                <option value="">Select status</option>
                {Array.isArray(productStatuses) && productStatuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              {errors?.status_id && <span className={styles.error}>{errors.status_id}</span>}
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
                className={`${styles.textarea} ${errors?.description ? styles.inputError : ''}`}
                placeholder="Enter detailed product description"
                rows="4"
              />
              {errors?.description && <span className={styles.error}>{errors.description}</span>}
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
                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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



