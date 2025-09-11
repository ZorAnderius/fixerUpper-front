import { useState } from 'react';
import AnimatedRoutes from "../../app/routes/animatedRoutes";
import Header from "../../widges/Header/Header";
import Footer from "../../widges/Footer/Footer";
import OrderDetailsModal from "../../components/OrderDetailsModal/OrderDetailsModal";
import AuthModal from "../../components/AuthModal/AuthModal";
import styles from "./SharedLayout.module.css";

const SharedLayout = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <AnimatedRoutes />
      </main>
      <Footer />
      <OrderDetailsModal />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default SharedLayout;
