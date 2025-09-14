import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field } from 'formik';
import { loginUser } from '../../redux/auth/operations';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated, selectUser } from '../../redux/auth/selectors';
import { ROUTES } from '../../helpers/constants/routes';
import { loginSchema } from '../../helpers/validation/schemas';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import { sanitizeEmail, sanitizeInput } from '../../helpers/security/sanitize';
import { useGoogleOAuth } from '../../contexts/GoogleOAuthContext';
import { redirectAfterAuth } from '../../helpers/auth/redirectAfterAuth';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import SecureForm from '../../components/SecureForm/SecureForm';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { redirectToGoogleAuth, isLoading: googleLoading, error: googleError } = useGoogleOAuth();
  
  // Simple redirect - to home page or from location.state
  const from = location.state?.from || '/';
  
  
  // useEffect for automatic redirection after login
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate, user]);

  // If user is already authenticated, redirect immediately
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Sanitize input data
      const sanitizedData = {
        email: sanitizeEmail(values.email),
        password: sanitizeInput(values.password, 128)
      };

      if (!sanitizedData.email) {
        throw new Error('Invalid email format');
      }

      await dispatch(loginUser(sanitizedData)).unwrap();
      
      // Navigation now happens automatically through useEffect
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await redirectToGoogleAuth();
    } catch (error) {
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* Left Side - Form */}
        <motion.div
          className={styles.formSection}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.formContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <h1 className={styles.logoText}>FixerUpper</h1>
              <div className={styles.logoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className={styles.titleSection}>
              <h2 className={styles.title}>Sign In</h2>
              <p className={styles.subtitle}>Sign in to stay connected</p>
            </div>

            {/* Form */}
            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className={styles.form}>
                  {/* Email */}
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && touched.email && (
                      <span className={styles.error}>{errors.email}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div className={styles.inputGroup}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`}
                      placeholder="Enter your password"
                    />
                    {errors.password && touched.password && (
                      <span className={styles.error}>{errors.password}</span>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className={styles.formOptions}>
                    <label className={styles.checkboxLabel}>
                      <Field
                        type="checkbox"
                        name="rememberMe"
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>Remember me?</span>
                    </label>
                    <Link to="/forgot-password" className={styles.forgotLink}>
                      Forgot Password
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}


                  {/* Register Link */}
                  <div className={styles.registerSection}>
                    <p className={styles.registerText}>
                      Don't have an account?{' '}
                      <Link to={ROUTES.REGISTER} className={styles.registerLink}>
                        Click here to sign up
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>

            {/* Google Login - OUTSIDE of Formik Form */}
            <div className={styles.socialSection}>
              <p className={styles.socialText}>or sign in with Google</p>
              <div className={styles.socialButtons}>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className={styles.socialButton}
                  aria-label="Sign in with Google"
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <Icon name={ICONS.GOOGLE} size={ICON_SIZES.MD} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Visual */}
        <motion.div
          className={styles.visualSection}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.visualContent}>
            <div className={styles.toolsGrid}>
              {/* Tool 1 - Drill */}
              <div className={styles.toolItem}>
                <div className={styles.toolImage}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Tool 2 - Saw */}
              <div className={styles.toolItem}>
                <div className={styles.toolImage}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Tool 3 - Measuring */}
              <div className={styles.toolItem}>
                <div className={styles.toolImage}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 15.16A2.5 2.5 0 0 0 19.5 14H4.5A2.5 2.5 0 0 0 2 16.5V17A2.5 2.5 0 0 0 4.5 19.5H19.5A2.5 2.5 0 0 0 22 17v-.84" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              {/* Tool 4 - Wrench */}
              <div className={styles.toolItem}>
                <div className={styles.toolImage}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Tool 5 - Hammer */}
              <div className={styles.toolItem}>
                <div className={styles.toolImage}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.64 15L22 10.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.91 11.7l-1.25-1.25L22 8.3a2.56 2.56 0 0 0-3.61-3.61L16.55 6.34 15.3 5.09a2.92 2.92 0 0 0-4.13 0L9.09 7.17a2.56 2.56 0 0 0 0 3.61l1.25 1.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Tool 6 - Screwdriver */}
              <div className={styles.toolItem}>
                <div className={styles.toolImage}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;