import { useState } from 'react';
import Logo from '../../components/Logo/Logo';
import Navigation from '../../components/Navigation/Navigation';
import MobileMenu from '../../components/MobileMenu/MobileMenu';
import AnimatedAuth from '../../components/AnimatedAuth/AnimatedAuth';
import CartIcon from '../../components/CartIcon/CartIcon';
import AdminNav from '../../components/AdminNav/AdminNav';
import Container from '../Container/Container';
import useScrollObserver from '../../hooks/useScrollObserver';
import styles from "./Header.module.css";

const Header = () => {
  const isScrolled = useScrollObserver(10);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <Container>
        <div className={styles.headerContent}>
          {/* Left side - Logo */}
          <div className={styles.headerLeft}>
            <Logo />
          </div>

          {/* Center - Navigation */}
          <div className={styles.headerCenter}>
            <Navigation />
          </div>

          {/* Right side - Cart, Admin Nav and Auth */}
          <div className={styles.headerRight}>
            <div className={styles.desktopActions}>
              {/* Admin Navigation */}
              <AdminNav />
              
              {/* Cart Icon */}
              <CartIcon />
              
              {/* Auth Buttons */}
              <AnimatedAuth />
            </div>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
