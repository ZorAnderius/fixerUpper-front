import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { ContentLoader } from "../../components/Loader";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.35 }}
        style={{ width: "100%" }}
      >
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            width: '100%'
          }}>
            <ContentLoader 
              variant="spinner"
              text="Loading page..."
            />
          </div>
        }>
          {outlet}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
