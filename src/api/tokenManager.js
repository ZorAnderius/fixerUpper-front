// import { clearAuth, setAuth } from "../redux/auth/slice"; // Dynamic import to avoid circular dependency
import { store } from "../redux/store";
import { clearCSRFToken} from "./csrfService.js";

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

// Listen for Redux store changes to sync token (lazy initialization)
let unsubscribe = null;

const initializeStoreSubscription = async () => {
  if (unsubscribe) return; // Already initialized
  
  try {
    const { store } = await import('../redux/store');
    unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const authState = state.auth;
      
      // If user becomes authenticated but we don't have token in memory
      if (authState?.isAuthenticated && !accessToken) {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          accessToken = storedToken;
        }
      }
      
      // If user becomes unauthenticated, clear token
      if (!authState?.isAuthenticated && accessToken) {
        accessToken = null;
      }
    });
  } catch (error) {
  }
};

export const getAccessToken = () => {
  // Initialize store subscription on first access (async, don't wait)
  initializeStoreSubscription().catch(error => {
  });
  
  // If no token in memory, try to get from localStorage
  if (!accessToken) {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      accessToken = storedToken;
    }
  }
  
  return accessToken;
};

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
  
  // Update Redux store synchronously
  if (token && user) {
    // Check if user is already in Redux store to avoid conflicts
    const currentState = store.getState();
    const currentUser = currentState.auth.user;
    
    if (!currentUser || currentUser.id !== user.id) {
      // Dynamic import to avoid circular dependency
      import("../redux/auth/slice").then(({ setAuth }) => {
        store.dispatch(setAuth({ user }));
      });
    }
  } else if (!token) {
    // Dynamic import to avoid circular dependency
    import("../redux/auth/slice").then(({ clearAuth }) => {
      store.dispatch(clearAuth());
    });
  }
};

export const refreshToken = async () => {
  // Initialize store subscription on first access
  await initializeStoreSubscription();
  
  
  // If no token in memory, try to get from localStorage
  let tokenToUse = accessToken;
  if (!tokenToUse) {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      tokenToUse = storedToken;
      accessToken = storedToken; // Update memory token
    }
  }
  
  if (!tokenToUse) {
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
        ...(tokenToUse && { Authorization: `Bearer ${tokenToUse}` })
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
    // Token refresh failed
    processQueue(err, null);
    setAccessToken(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
};
