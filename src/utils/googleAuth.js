// Google OAuth utility functions
export const openGoogleAuthPopup = async () => {
  try {
    console.log('Starting Google OAuth popup...');
    
    // Get OAuth URL from backend
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/users/request-google-oauth`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get OAuth URL: ${response.status}`);
    }

    const data = await response.json();
    console.log('OAuth response data:', data);
    
    // Get the OAuth URL
    const oauthUrl = data.data?.url || data.url;
    if (!oauthUrl) {
      throw new Error('No OAuth URL found in response');
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
  } catch (error) {
    console.error('Google OAuth popup error:', error);
    throw error;
  }
};

export const handleGoogleAuthRedirect = async () => {
  try {
    console.log('Starting Google OAuth redirect...');
    
    // Get OAuth URL from backend
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/users/request-google-oauth`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get OAuth URL: ${response.status}`);
    }

    const data = await response.json();
    console.log('OAuth response data:', data);
    
    // Get the OAuth URL
    const oauthUrl = data.data?.url || data.url;
    if (!oauthUrl) {
      throw new Error('No OAuth URL found in response');
    }

    console.log('Redirecting to Google OAuth URL:', oauthUrl);
    window.location.href = oauthUrl;
  } catch (error) {
    console.error('Google OAuth redirect error:', error);
    // Fallback to direct redirect
    console.log('Falling back to direct redirect...');
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/users/request-google-oauth`;
  }
};



