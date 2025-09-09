import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/auth/slice';
import { ROUTES } from '../../helpers/constants/routes';
import { redirectAfterAuth, redirectAfterAuthWithError } from '../../helpers/auth/redirectAfterAuth';
import styles from './GoogleAuthCallback.module.css';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('processing');
        
        // Get the full URL with all parameters
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if we have the authorization code
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        console.log('Full URL:', window.location.href);
        console.log('URL search params:', window.location.search);
        console.log('All URL params:', Object.fromEntries(urlParams.entries()));
        console.log('Code from URL:', code);
        console.log('Error from URL:', error);

        if (error) {
          console.error('Google OAuth error:', error);
          setStatus('error');
          setTimeout(() => {
            redirectAfterAuthWithError(navigate, 'Google authentication failed. Please try again.', ROUTES.LOGIN);
          }, 2000);
          return;
        }

        if (code) {
        setStatus('authenticating');
        
        console.log('Received OAuth code:', code);
        console.log('Code length:', code.length);
        console.log('Code type:', typeof code);
        console.log('Sending POST request to confirm-oauth');
        
        // Send the code to our backend via POST
        const requestBody = { code };
        console.log('Request body:', requestBody);
        console.log('Request body JSON:', JSON.stringify(requestBody));
        
        const response = await fetch(`http://localhost:3000/api/users/confirm-oauth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-No-CSRF': '1', // Disable CSRF check
          },
          // credentials: 'include', // Temporarily disabled
          body: JSON.stringify(requestBody),
        });

          console.log('OAuth callback response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OAuth callback error response:', errorData);
            throw new Error(`Failed to authenticate with Google: ${response.status} - ${errorData.message || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log('OAuth callback success data:', data);
          
          // Store the user data and token
          if (data.data.accessToken && data.data.user) {
            // Save access token to localStorage
            localStorage.setItem('accessToken', data.data.accessToken);
            
            // Update Redux store
            dispatch(loginSuccess({
              user: data.data.user,
              accessToken: data.data.accessToken
            }));
            
            setStatus('success');
            setTimeout(() => {
              redirectAfterAuth(navigate, '/');
            }, 1500);
          } else {
            throw new Error('Invalid response from server');
          }
        } else {
          setStatus('error');
          setTimeout(() => {
            redirectAfterAuthWithError(navigate, 'No authorization code received from Google.', ROUTES.LOGIN);
          }, 2000);
        }
      } catch (error) {
        console.error('Google OAuth authentication failed:', error);
        setStatus('error');
        setTimeout(() => {
          redirectAfterAuthWithError(navigate, 'Google authentication failed. Please try again.', ROUTES.LOGIN);
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

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