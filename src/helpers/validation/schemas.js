import * as Yup from 'yup';

// Login schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
});

// Registration schema
export const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name cannot exceed 30 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(30, 'Last name cannot exceed 30 characters')
    .required('Last name is required'),
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^07\d{8,9}$/, 'Phone number must be in format 07XXXXXXXXX (10-11 digits)')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Password confirmation is required'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms of use')
});

// Create product schema
export const createProductSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must contain at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must contain at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .required('Description is required'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required'),
  quantity: Yup.number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required'),
  category_id: Yup.string()
    .uuid('Category ID must be a valid UUID')
    .required('Category is required'),
  status_id: Yup.string()
    .uuid('Status ID must be a valid UUID')
    .required('Status is required')
});

// Update product schema
export const updateProductSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must contain at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: Yup.string()
    .min(10, 'Description must contain at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  price: Yup.number()
    .positive('Price must be positive'),
  quantity: Yup.number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  category_id: Yup.string()
    .uuid('Category ID must be a valid UUID'),
  status_id: Yup.string()
    .uuid('Status ID must be a valid UUID')
});

// Add to cart schema
export const addToCartSchema = Yup.object().shape({
  product_id: Yup.string()
    .uuid('Product ID must be a valid UUID')
    .required('Product ID is required'),
  quantity: Yup.number()
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required')
});

// Update cart item quantity schema
export const updateCartItemSchema = Yup.object().shape({
  quantity: Yup.number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required')
});

