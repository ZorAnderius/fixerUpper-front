import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import './App.css'
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { refreshToken, getAccessToken } from '../api/tokenManager';
import { getCurrentUser } from '../redux/auth/operations';
import { GoogleOAuthProvider } from '../contexts/GoogleOAuthContext';
import { store } from '../redux/store';
import { PageLoader, ContentLoader } from '../components/Loader';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Wait a bit for Redux persist to rehydrate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check Redux state first
        const state = store.getState();
        const authState = state.auth;
        
        // Check localStorage directly
        const storedToken = localStorage.getItem('accessToken');
        
        // Only try to refresh token if we have one
        const existingToken = getAccessToken();
        if (existingToken) {
          // Try to refresh token first
          await refreshToken();
          // Always call getCurrentUser to ensure we have complete user data including role
          try {
            await dispatch(getCurrentUser()).unwrap();
          } catch (error) {
            console.error('getCurrentUser failed after refresh:', error);
          }
        }
        // If no token, don't try to get current user - user is not authenticated
      } catch (err) {
        // If refresh fails, user is not authenticated - this is normal
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  // Only show loader on very first load
  if (!isInitialized) {
    return <PageLoader text="Initializing application..." />;
  }

  return (
    <GoogleOAuthProvider>
      <RouterProvider
        router={router}
        fallbackElement={
          <ContentLoader 
            variant="spinner"
            text="Loading page..."
          />
        }
      />
    </GoogleOAuthProvider>
  );
}

export default App