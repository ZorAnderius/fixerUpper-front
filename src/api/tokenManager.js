import { clearAuth, setAuth } from "../redux/auth/slice";
import { store } from "../redux/store";

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
    console.log('tokenManager.initializeToken - storedToken:', storedToken);
    if (storedToken) {
      accessToken = storedToken;
      console.log('tokenManager.initializeToken - token set to:', accessToken);
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
  }
  
  channel.postMessage({ type: "TOKEN_REFRESH", accessToken: token });
  if (token && user) {
    console.log('tokenManager.setAccessToken - dispatching setAuth with user:', user);
    store.dispatch(setAuth({ user }));
  } else if (!token) {
    console.log('tokenManager.setAccessToken - dispatching clearAuth');
    store.dispatch(clearAuth());
  }
};

export const refreshToken = async () => {
  console.log('refreshToken called, accessToken:', accessToken);
  
  if (!accessToken) {
    console.log('No access token, returning null');
    return null;
  }

  if (isRefreshing) {
    console.log('Already refreshing, adding to queue');
    return new Promise((resolve, reject) =>
      pendingQueue.push({ resolve, reject })
    );
  }

  isRefreshing = true;
  console.log('Starting token refresh...');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `http://localhost:3000/api/users/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: { "X-No-CSRF": "1" },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    console.log('Refresh response status:', res.status);

    if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
    const data = await res.json();
    console.log('Refresh response data:', data);

    // Extract data from nested structure
    const { accessToken, user } = data.data;
    setAccessToken(accessToken, user);
    processQueue(null, accessToken);

    return accessToken;
  } catch (err) {
    console.error('Refresh token error:', err);
    processQueue(err, null);
    setAccessToken(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
};
