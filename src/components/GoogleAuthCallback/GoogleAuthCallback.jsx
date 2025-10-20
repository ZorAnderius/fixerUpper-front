import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAccessToken } from '../../api/tokenManager';
import { ROUTES } from '../../helpers/constants/routes';
import { redirectAfterAuth, redirectAfterAuthWithError } from '../../helpers/auth/redirectAfterAuth';
import styles from './GoogleAuthCallback.module.css';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple calls
      if (hasProcessed) {
        return;
      }
      
      try {
        setHasProcessed(true);
        setStatus('processing');
        
        // Clear any old tokens first
        localStorage.removeItem('accessToken');
        
        // Get the full URL with all parameters
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if we have the authorization code
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        

        if (error) {
          setStatus('error');
          setTimeout(() => {
            redirectAfterAuthWithError(navigate, 'Google authentication failed. Please try again.', ROUTES.LOGIN);
          }, 2000);
          return;
        }

        if (code) {
        setStatus('authenticating');
        
        
        // Send the code to our backend via POST using API client
        const { default: api } = await import('../../api/client.js');
        
        try {
          const response = await api.post('/users/confirm-oauth', { code });

          const data = response.data;
          
          // Store the user data and token
          if (data.data.accessToken && data.data.user) {
            // Save access token and update Redux store
            setAccessToken(data.data.accessToken, data.data.user);
            
            setStatus('success');
            setTimeout(() => {
              redirectAfterAuth(navigate, '/');
            }, 1500);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (apiError) {
          console.error('Google OAuth API Error:', apiError);
          const errorData = apiError.response?.data || { message: apiError.message };
          throw new Error(`Failed to authenticate with Google: ${apiError.response?.status || 'Unknown'} - ${errorData.message || 'Unknown error'}`);
        }
        } else {
          setStatus('error');
          setTimeout(() => {
            redirectAfterAuthWithError(navigate, 'No authorization code received from Google.', ROUTES.LOGIN);
          }, 2000);
        }
      } catch (error) {
        setStatus('error');
        setTimeout(() => {
          redirectAfterAuthWithError(navigate, 'Google authentication failed. Please try again.', ROUTES.LOGIN);
        }, 2000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array - run only once

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return 'Loading...';
      case 'processing':
        return 'Processing Google response...';
      case 'authenticating':
        return 'Authenticating with Google...';
      case 'success':
        return 'Authentication successful! Redirecting...';
      case 'error':
        return 'Authentication failed. Redirecting to login...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p className={styles.text}>{getStatusMessage()}</p>
        {status === 'error' && (
          <p className={styles.errorText}>
            Please try logging in again.
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;