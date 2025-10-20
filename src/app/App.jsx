import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import './App.css'
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { refreshToken, getAccessToken, setAccessToken } from '../api/tokenManager';
import { getCurrentUser } from '../redux/auth/operations';
import { GoogleOAuthProvider } from '../contexts/GoogleOAuthContext';
import { store, persistor } from '../redux/store';
import { PageLoader, ContentLoader } from '../components/Loader';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Wait for Redux persist to rehydrate
        await new Promise(resolve => setTimeout(resolve, 200));
        const existingToken = getAccessToken();
        if (existingToken) {
          // Try to refresh token first
          try {
            await refreshToken();
            // Always call getCurrentUser to ensure we have complete user data including role
            await dispatch(getCurrentUser()).unwrap();
          } catch (error) {
            console.error('Auth initialization failed:', error);
            // Clear invalid token
            setAccessToken(null);
          }
        }
        // If no token, don't try to get current user - user is not authenticated
      } catch (err) {
        console.error('Auth initialization error:', err);
        // If refresh fails, user is not authenticated - this is normal
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <PersistGate loading={<PageLoader text="Loading application..." />} persistor={persistor}>
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
    </PersistGate>
  );
}

export default App