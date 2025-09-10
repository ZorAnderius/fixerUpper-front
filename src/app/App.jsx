import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import './App.css'
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { refreshToken } from '../api/tokenManager';
import { getCurrentUser } from '../redux/auth/operations';
import { GoogleOAuthProvider } from '../contexts/GoogleOAuthContext';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token first - this will also set user data if successful
        await refreshToken();
        // No need to call getCurrentUser since refresh now returns user data
      } catch (err) {
        console.error("Auth initialization failed:", err);
        // If refresh fails, user is not authenticated - this is normal
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading app...
      </div>
    );
  }

  return (
    <GoogleOAuthProvider>
      <RouterProvider
        router={router}
        fallbackElement={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px'
          }}>
            Loading page...
          </div>
        }
      />
    </GoogleOAuthProvider>
  );
}

export default App
