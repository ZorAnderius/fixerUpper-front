import { getAccessToken, setAccessToken, refreshToken } from './tokenManager';

// Auth services object
export const authServices = {
  register: async (userData) => {
    const response = await fetch(`http://localhost:3000/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-No-CSRF': '1',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const data = await response.json();
    
    // Extract data from nested structure
    const { accessToken, user } = data.data;
    setAccessToken(accessToken, user);
    
    return { accessToken, user };
  },

  login: async (credentials) => {
    console.log('authServices.login called with:', credentials);
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-No-CSRF': '1',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed with status:', response.status);
        console.error('Login error response:', errorText);
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      // Extract data from nested structure
      const { accessToken, user } = data.data;
      setAccessToken(accessToken, user);
      
      return { accessToken, user };
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  },

  logout: async () => {
    const token = getAccessToken();
    console.log('authServices.logout called with token:', token ? 'present' : 'missing');
    
    const response = await fetch(`http://localhost:3000/api/users/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-No-CSRF': '1',
      },
      credentials: 'include',
    });
    
    console.log('Logout response status:', response.status);
    
    setAccessToken(null);
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  getCurrentUser: async () => {
    const response = await fetch(`http://localhost:3000/api/users/current`, {
      method: 'GET',
      headers: {
        'X-No-CSRF': '1',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    const data = await response.json();
    
    // Extract data from nested structure
    const { user } = data.data;
    
    return { user };
  },

  updateAvatar: async (formData) => {
    const response = await fetch(`http://localhost:3000/api/users/update-avatar`, {
      method: 'PATCH',
      headers: {
        'X-No-CSRF': '1',
      },
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update avatar');
    }
    
    return response.json();
  },

  authenticateWithGoogleOAuth: async (data) => {
    const response = await fetch(`http://localhost:3000/api/users/confirm-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-No-CSRF': '1',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Google authentication failed');
    }
    
    const result = await response.json();
    setAccessToken(result.accessToken, result.user);
    
    return result;
  }
};