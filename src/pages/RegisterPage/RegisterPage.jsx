import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field } from 'formik';
import { registerUser } from '../../redux/auth/operations';
import { selectAuthLoading, selectAuthError } from '../../redux/auth/selectors';
import { transferPendingCartToCart } from '../../redux/pending/operations';
import { clearPendingState } from '../../redux/pending/slice';
import { ROUTES } from '../../helpers/constants/routes';
import { registerSchema } from '../../helpers/validation/schemas';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import { sanitizeEmail, sanitizeInput, sanitizePhone } from '../../helpers/security/sanitize';
import { useGoogleOAuth } from '../../contexts/GoogleOAuthContext';
import { redirectAfterAuth } from '../../helpers/auth/redirectAfterAuth';
import Button from '../../components/Button/Button';
import Icon from '../../components/Icon/Icon';
import SecureForm from '../../components/SecureForm/SecureForm';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const { redirectToGoogleAuth, isLoading: googleLoading, error: googleError } = useGoogleOAuth();
  
  // Отримуємо дані з Redux pending стану (який зберігається в redux-persist)
  const pendingState = useSelector(state => state.pending);
  const from = pendingState.previousLocation || location.state?.from || '/';
  const hasPendingItems = pendingState.pendingCartItems.length > 0 || location.state?.hasPendingItems || false;

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Sanitize input data
      const sanitizedData = {
        firstName: sanitizeInput(values.firstName, 30),
        lastName: sanitizeInput(values.lastName, 30),
        email: sanitizeEmail(values.email),
        password: sanitizeInput(values.password, 128),
        phoneNumber: sanitizePhone(values.phoneNumber)
      };

      // Log the data being sent

      // Validate sanitized data
      if (!sanitizedData.email) {
        throw new Error('Invalid email format');
      }
      if (!sanitizedData.phoneNumber) {
        throw new Error('Invalid phone number format');
      }

      await dispatch(registerUser(sanitizedData)).unwrap();
      
      // Якщо є pending товари, переносимо їх в кошик
      if (hasPendingItems) {
        await dispatch(transferPendingCartToCart()).unwrap();
      }
      
      // Редиректимо на попередню сторінку або головну
      navigate(from, { replace: true });
      
      // Очищаємо pending стан ПІСЛЯ навігації
      dispatch(clearPendingState());
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };


  const handleGoogleAuth = async () => {
    try {
      await redirectToGoogleAuth();
    } catch (error) {
      console.error('Google OAuth error:', error);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <motion.div className={styles.formSection} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className={styles.formContent}>
            <div className={styles.logo}>
              <h1 className={styles.logoText}>FixerUpper</h1>
            </div>
            <div className={styles.titleSection}>
              <h2 className={styles.title}>Sign Up</h2>
              <p className={styles.subtitle}>Create your FixerUpper account</p>
            </div>
            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, values }) => (
                <Form className={styles.form}>
                  <div className={styles.nameFields}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="firstName" className={styles.label}>First Name</label>
                      <Field 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      className={`${styles.input} ${errors.firstName && touched.firstName ? styles.inputError : ''} ${!errors.firstName && touched.firstName && values.firstName ? styles.valid : ''}`} 
                      placeholder="Enter your first name" 
                    />
                      {errors.firstName && touched.firstName && <span className={styles.error}>{errors.firstName}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="lastName" className={styles.label}>Last Name</label>
                      <Field 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        className={`${styles.input} ${errors.lastName && touched.lastName ? styles.inputError : ''} ${!errors.lastName && touched.lastName && values.lastName ? styles.valid : ''}`} 
                        placeholder="Enter your last name" 
                      />
                      {errors.lastName && touched.lastName && <span className={styles.error}>{errors.lastName}</span>}
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <Field 
                      type="email" 
                      id="email" 
                      name="email" 
                      className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''} ${!errors.email && touched.email && values.email ? styles.valid : ''}`} 
                      placeholder="Enter your email" 
                    />
                    {errors.email && touched.email && <span className={styles.error}>{errors.email}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phoneNumber" className={styles.label}>Phone No.</label>
                    <Field 
                      type="tel" 
                      id="phoneNumber" 
                      name="phoneNumber" 
                      className={`${styles.input} ${errors.phoneNumber && touched.phoneNumber ? styles.inputError : ''} ${!errors.phoneNumber && touched.phoneNumber && values.phoneNumber ? styles.valid : ''}`} 
                      placeholder="07XXXXXXXXX"
                    />
                    {errors.phoneNumber && touched.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
                  </div>
                  <div className={styles.passwordFields}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="password" className={styles.label}>Password</label>
                      <Field type="password" id="password" name="password" className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ''}`} placeholder="Enter your password" />
                      {errors.password && touched.password && <span className={styles.error}>{errors.password}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
                      <Field type="password" id="confirmPassword" name="confirmPassword" className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`} placeholder="Confirm your password" />
                      {errors.confirmPassword && touched.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                    </div>
                  </div>
                  <div className={styles.termsSection}>
                    <label className={styles.checkboxLabel}>
                      <Field type="checkbox" name="agreeToTerms" className={styles.checkbox} />
                      <span className={styles.checkboxText}>I agree with the terms of use</span>
                    </label>
                    {errors.agreeToTerms && touched.agreeToTerms && <span className={styles.error}>{errors.agreeToTerms}</span>}
                  </div>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? 'Signing up...' : 'Sign up'}
                  </button>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                  <div className={styles.socialSection}>
                    <p className={styles.socialText}>or sign up with Google</p>
                    <div className={styles.socialButtons}>
                      <button 
                        type="button" 
                        onClick={handleGoogleAuth} 
                        className={styles.socialButton} 
                        aria-label="Sign up with Google"
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
                  <div className={styles.loginSection}>
                    <p className={styles.loginText}>Already have an Account <Link to={ROUTES.LOGIN} className={styles.loginLink}>Sign in</Link></p>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;