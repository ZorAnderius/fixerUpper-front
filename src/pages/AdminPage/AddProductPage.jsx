import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Formik, Form, Field } from 'formik';
import { createProduct, fetchCategories, fetchProductStatuses } from '../../redux/products/operations';
import { selectCategories, selectProductStatuses, selectProductsLoading, selectProductsError } from '../../redux/products/selectors';
import { selectIsAdmin } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import { createProductSchema } from '../../helpers/validation/schemas';
import { sanitizeInput, sanitizeEmail } from '../../helpers/security/sanitize';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import { ContentLoader } from '../../components/Loader';
import styles from './AddProductPage.module.css';

const AddProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const productStatuses = useSelector(selectProductStatuses);
  const isLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const isAdmin = useSelector(selectIsAdmin);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load categories and product statuses on component mount
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchCategories());
      dispatch(fetchProductStatuses());
    } else {
      navigate(ROUTES.PRODUCTS);
    }
  }, [dispatch, isAdmin, navigate]);

  // Redirect if not admin
  if (!isAdmin) {
    return null;
  }

  const initialValues = {
    title: '',
    description: '',
    price: '',
    quantity: '',
    category_id: '',
    status_id: '',
    product_image: null
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Sanitize input data
      const sanitizedData = {
        title: sanitizeInput(values.title, 100),
        description: sanitizeInput(values.description, 1000),
        price: parseFloat(values.price),
        quantity: parseInt(values.quantity),
        category_id: values.category_id, // Keep as string (UUID)
        status_id: values.status_id, // Keep as string (UUID)
        product_image: values.product_image
      };

      await dispatch(createProduct(sanitizedData)).unwrap();
      navigate(ROUTES.ADMIN);
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('product_image', file);
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (setFieldValue) => {
    setFieldValue('product_image', null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (isLoading && !categories.length) {
    return (
      <div className={styles.pageContainer}>
        <ContentLoader 
          variant="dots"
          text="Loading form data..."
        />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.ADMIN)}
            className={styles.backButton}
          >
            <Icon name={ICONS.CHEVRON} size={ICON_SIZES.SM} />
            Back to Admin
          </Button>
          <h1 className={styles.title}>Add New Product</h1>
        </motion.div>

        <motion.div
          className={styles.formContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={createProductSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form className={styles.form}>
                <div className={styles.formGrid}>
                  {/* Left Column */}
                  <div className={styles.leftColumn}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="title" className={styles.label}>
                        Product Title *
                      </label>
                      <Field
                        type="text"
                        id="title"
                        name="title"
                        className={`${styles.input} ${
                          errors.title && touched.title ? styles.inputError : ''
                        } ${
                          !errors.title && touched.title && values.title ? styles.valid : ''
                        }`}
                        placeholder="Enter product title"
                      />
                      {errors.title && touched.title && (
                        <span className={styles.error}>{errors.title}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="price" className={styles.label}>
                        Price *
                      </label>
                      <Field
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        min="0"
                        className={`${styles.input} ${
                          errors.price && touched.price ? styles.inputError : ''
                        } ${
                          !errors.price && touched.price && values.price ? styles.valid : ''
                        }`}
                        placeholder="0.00"
                      />
                      {errors.price && touched.price && (
                        <span className={styles.error}>{errors.price}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="quantity" className={styles.label}>
                        Quantity *
                      </label>
                      <Field
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="0"
                        className={`${styles.input} ${
                          errors.quantity && touched.quantity ? styles.inputError : ''
                        } ${
                          !errors.quantity && touched.quantity && values.quantity ? styles.valid : ''
                        }`}
                        placeholder="0"
                      />
                      {errors.quantity && touched.quantity && (
                        <span className={styles.error}>{errors.quantity}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="category_id" className={styles.label}>
                        Category *
                      </label>
                      <Field
                        as="select"
                        id="category_id"
                        name="category_id"
                        className={`${styles.select} ${
                          errors.category_id && touched.category_id ? styles.inputError : ''
                        } ${
                          !errors.category_id && touched.category_id && values.category_id ? styles.valid : ''
                        }`}
                      >
                        <option value="">Select a category</option>
                        {Array.isArray(categories) && categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Field>
                      {errors.category_id && touched.category_id && (
                        <span className={styles.error}>{errors.category_id}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="status_id" className={styles.label}>
                        Status *
                      </label>
                      <Field
                        as="select"
                        id="status_id"
                        name="status_id"
                        className={`${styles.select} ${
                          errors.status_id && touched.status_id ? styles.inputError : ''
                        } ${
                          !errors.status_id && touched.status_id && values.status_id ? styles.valid : ''
                        }`}
                      >
                        <option value="">Select a status</option>
                        {Array.isArray(productStatuses) && productStatuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </Field>
                      {errors.status_id && touched.status_id && (
                        <span className={styles.error}>{errors.status_id}</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className={styles.rightColumn}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="description" className={styles.label}>
                        Description *
                      </label>
                      <Field
                        as="textarea"
                        id="description"
                        name="description"
                        rows="6"
                        className={`${styles.textarea} ${
                          errors.description && touched.description ? styles.inputError : ''
                        } ${
                          !errors.description && touched.description && values.description ? styles.valid : ''
                        }`}
                        placeholder="Enter product description"
                      />
                      {errors.description && touched.description && (
                        <span className={styles.error}>{errors.description}</span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="product_image" className={styles.label}>
                        Product Image
                      </label>
                      <div className={styles.imageUpload}>
                        <input
                          type="file"
                          id="product_image"
                          name="product_image"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                          className={styles.fileInput}
                        />
                        <label htmlFor="product_image" className={styles.fileLabel}>
                          {selectedImage ? 'Change Image' : 'Choose Image'}
                        </label>
                        
                        {imagePreview && (
                          <div className={styles.imagePreview}>
                            <img src={imagePreview} alt="Preview" />
                            <button
                              type="button"
                              onClick={() => removeImage(setFieldValue)}
                              className={styles.removeImage}
                            >
                              <Icon name={ICONS.CHEVRON} size={ICON_SIZES.SM} />
                            </button>
                          </div>
                        )}
                      </div>
                      {errors.product_image && touched.product_image && (
                        <span className={styles.error}>{errors.product_image}</span>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(ROUTES.ADMIN)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || isLoading}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Product...' : 'Create Product'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProductPage;
