import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Container from '../Container/Container';
import Icon from '../../components/Icon/Icon';
import { ICONS, ICON_SIZES } from '../../helpers/constants/icons';
import { ROUTES } from '../../helpers/constants/routes';
import { selectIsAuthenticated } from '../../redux/auth/selectors';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.footerContent}>
          {/* Company Info */}
          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.logoSection}>
              <h3 className={styles.logoTitle}>FixerUpper</h3>
              <p className={styles.logoSubtitle}>Professional tools for craftsmen</p>
            </div>
            <p className={styles.companyDescription}>
              We provide quality tools and equipment for professional craftsmen and home DIY enthusiasts. 
              From drills to measuring instruments - we have everything you need for your projects.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linksList}>
              <li><Link to={ROUTES.MAIN} className={styles.footerLink}>Home</Link></li>
              <li><Link to={ROUTES.PRODUCTS} className={styles.footerLink}>Product Catalogue</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link to={ROUTES.CART} className={styles.footerLink}>Cart</Link></li>
                  <li><Link to={ROUTES.PROFILE} className={styles.footerLink}>Profile</Link></li>
                </>
              )}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className={styles.sectionTitle}>Categories</h4>
            <ul className={styles.linksList}>
              <li><Link to={`${ROUTES.PRODUCTS}?category=drills`} className={styles.footerLink}>Drills</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=saws`} className={styles.footerLink}>Jigsaws</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=measuring`} className={styles.footerLink}>Measuring Tools</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=hand-tools`} className={styles.footerLink}>Hand Tools</Link></li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linksList}>
              <li><span className={styles.footerText}>Email: info@fixerupper.com</span></li>
              <li><span className={styles.footerText}>Phone: +44 (0) 20 7123 4567</span></li>
              <li><span className={styles.footerText}>Mon-Fri: 9:00-18:00</span></li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className={styles.sectionTitle}>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Icon name={ICONS.FACEBOOK} size={ICON_SIZES.MD} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Icon name={ICONS.INSTAGRAM} size={ICON_SIZES.MD} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="YouTube">
                <Icon name={ICONS.YOUTUBE} size={ICON_SIZES.MD} />
              </a>
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Icon name={ICONS.LOCATION} size={ICON_SIZES.SM} />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className={styles.footerBottom}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {currentYear} FixerUpper. All rights reserved.
            </p>
          </div>
        </motion.div>
      </Container>
    </footer>
  );
};

export default Footer;