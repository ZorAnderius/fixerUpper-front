/**
 * Security headers configuration
 */

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "'unsafe-eval'", // Required for Vite in development
    'https://accounts.google.com', // For Google OAuth
    'https://apis.google.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS modules and inline styles
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'http:' // For development
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'connect-src': [
    "'self'",
    'https://accounts.google.com',
    'https://apis.google.com',
    'http://localhost:3000', // For development
    'https://your-api-domain.com' // Replace with production API
  ],
  'frame-src': [
    "'self'",
    'https://accounts.google.com'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"]
};

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': Object.entries(CSP_CONFIG)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
};

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with production domain
    : ['http://localhost:5173', 'http://localhost:5174'], // Development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ]
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static assets
    return req.url.includes('/static/') || req.url.includes('/assets/');
  }
};

/**
 * Session security configuration
 */
export const SESSION_CONFIG = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
};

/**
 * Input validation limits
 */
export const INPUT_LIMITS = {
  MAX_STRING_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_PASSWORD_LENGTH: 128,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_UPLOAD_FILES: 5,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
};

/**
 * API endpoint security
 */
export const API_SECURITY = {
  // Endpoints that require authentication
  PROTECTED_ENDPOINTS: [
    '/api/users/profile',
    '/api/users/update-avatar',
    '/api/products/create',
    '/api/products/update',
    '/api/products/delete',
    '/api/orders',
    '/api/cart'
  ],
  
  // Endpoints that require admin role
  ADMIN_ENDPOINTS: [
    '/api/products/create',
    '/api/products/update',
    '/api/products/delete',
    '/api/users/admin'
  ],
  
  // Public endpoints
  PUBLIC_ENDPOINTS: [
    '/api/users/register',
    '/api/users/login',
    '/api/users/request-google-oauth',
    '/api/users/confirm-oauth',
    '/api/products',
    '/api/categories',
    '/api/product-statuses'
  ]
};








