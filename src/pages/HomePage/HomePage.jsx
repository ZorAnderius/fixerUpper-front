import Hero from '../../components/Hero/Hero';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <Hero />
    </div>
  );
};

export default HomePage;