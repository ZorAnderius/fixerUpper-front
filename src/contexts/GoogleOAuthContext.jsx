import { createContext, useContext, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { authenticateWithGoogleOAuth } from '../redux/auth/operations';

const GoogleOAuthContext = createContext();

export const useGoogleOAuth = () => {
  const context = useContext(GoogleOAuthContext);
  if (!context) {
    throw new Error('useGoogleOAuth must be used within a GoogleOAuthProvider');
  }
  return context;
};

export const GoogleOAuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const getOAuthUrl = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get OAuth URL from backend (correct approach)
      const getApiBaseUrl = () => {
        if (window.location.hostname.includes('vercel.app')) {
          return 'https://fixerupper-back.onrender.com/api';
        }
        return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      };
      
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/users/request-google-oauth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get OAuth URL: ${response.status}`);
      }

      const data = await response.json();
      
      // Return the OAuth URL from backend
      const oauthUrl = data.data?.url || data.url;
      return oauthUrl;
    } catch (err) {
      console.error('Error getting OAuth URL:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticateWithGoogle = useCallback(async (code) => {
    try {
      setIsLoading(true);
      setError(null);


      // Determine API base URL
      const getApiBaseUrl = () => {
        if (window.location.hostname.includes('vercel.app')) {
          return 'https://fixerupper-back.onrender.com/api';
        }
        return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      };
      
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/users/confirm-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-No-CSRF': '1', // Disable CSRF check
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OAuth error response:', errorData);
        throw new Error(`Failed to authenticate with Google: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Dispatch the authentication action
      await dispatch(authenticateWithGoogleOAuth({
        accessToken: data.accessToken,
        user: data.user
      })).unwrap();

      return data;
    } catch (err) {
      console.error('Error authenticating with Google:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const openGoogleAuthPopup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const oauthUrl = await getOAuthUrl();
      if (!oauthUrl) {
        throw new Error('No OAuth URL received');
      }

      // Open popup window
      const popup = window.open(
        oauthUrl,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for popup messages
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        // Listen for messages from popup
        const messageListener = (event) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            resolve(event.data.user);
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);
      });
    } catch (err) {
      console.error('Error opening Google Auth popup:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getOAuthUrl]);

  const redirectToGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);


      // Get OAuth URL from backend (correct Client ID)
      const oauthUrl = await getOAuthUrl();
      if (!oauthUrl) {
        throw new Error('No OAuth URL received');
      }

      
      // Use window.location.href only for external OAuth redirect
      // This is necessary because Google OAuth requires a full page redirect
      window.location.href = oauthUrl;
      
    } catch (err) {
      console.error('Error redirecting to Google Auth:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getOAuthUrl]);

  const value = {
    isLoading,
    error,
    getOAuthUrl,
    authenticateWithGoogle,
    openGoogleAuthPopup,
    redirectToGoogleAuth,
  };

  return (
    <GoogleOAuthContext.Provider value={value}>
      {children}
    </GoogleOAuthContext.Provider>
  );
};