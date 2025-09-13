import { clearAuth, setAuth } from "../redux/auth/slice";
import { store } from "../redux/store";
import { clearCSRFToken, setCSRFToken } from "./csrfService.js";

let accessToken = null;
let isRefreshing = false;
let pendingQueue = [];

// BroadcastChannel for synchronization
const channel = new BroadcastChannel("auth_channel");

channel.onmessage = (event) => {
  if (event.data.type === "TOKEN_REFRESH") {
    accessToken = event.data.accessToken;
    processQueue(null, accessToken);
  }
};

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

// Initialize token from localStorage on module load
const initializeToken = () => {
  try {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      accessToken = storedToken;
    }
  } catch (error) {
    console.error('Failed to initialize token from localStorage:', error);
  }
};

// Initialize token when module loads
initializeToken();

export const getAccessToken = () => accessToken;

export const setAccessToken = (token, user = null) => {
  accessToken = token;
  
  // Save to localStorage
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
    // Clear CSRF token when access token is cleared
    clearCSRFToken();
  }
  
  channel.postMessage({ type: "TOKEN_REFRESH", accessToken: token });
  if (token && user) {
    store.dispatch(setAuth({ user }));
  } else if (!token) {
    store.dispatch(clearAuth());
  }
};

export const refreshToken = async () => {
  if (!accessToken) {
    return null;
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) =>
      pendingQueue.push({ resolve, reject })
    );
  }

  isRefreshing = true;

  try {
    // Import api client here to avoid circular dependency
    const { default: api } = await import('./client.js');
    
    const response = await api.post('/users/refresh', {}, {
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      }
    });
    
    // Extract data from nested structure
    const { accessToken: newAccessToken, user } = response.data.data || response.data;
    
    if (newAccessToken) {
      setAccessToken(newAccessToken, user);
      processQueue(null, newAccessToken);
      return newAccessToken;
    }
    
    return null;
  } catch (err) {
    processQueue(err, null);
    setAccessToken(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
};
