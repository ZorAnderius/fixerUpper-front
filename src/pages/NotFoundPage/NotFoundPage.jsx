import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../helpers/constants/routes';
import Container from '../../widges/Container/Container';
import Section from '../../widges/Section/Section';
import Button from '../../components/Button/Button';
import styles from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(ROUTES.MAIN);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Section>
      <Container>
        <div className={styles.notFoundPage}>
          <div className={styles.content}>
            {/* 404 Illustration */}
            <div className={styles.illustration}>
              <div className={styles.errorNumber}>
                <span className={styles.four}>4</span>
                <span className={styles.zero}>0</span>
                <span className={styles.four}>4</span>
              </div>
              <div className={styles.toolIcon}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div className={styles.message}>
              <h1 className={styles.title}>Page Not Found</h1>
              <p className={styles.description}>
                Oops! The page you're looking for seems to have wandered off. 
                It might be under construction or the URL might be incorrect.
              </p>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGoHome}
                className={styles.homeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go Home
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={handleGoBack}
                className={styles.backButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go Back
              </Button>
            </div>

            {/* Helpful Links */}
            <div className={styles.helpfulLinks}>
              <h3 className={styles.linksTitle}>Maybe you're looking for:</h3>
              <div className={styles.links}>
                <button 
                  className={styles.link}
                  onClick={() => navigate(ROUTES.PRODUCTS)}
                >
                  Product Catalog
                </button>
                <button 
                  className={styles.link}
                  onClick={() => navigate(ROUTES.CART)}
                >
                  Shopping Cart
                </button>
                <button 
                  className={styles.link}
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  My Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default NotFoundPage;
