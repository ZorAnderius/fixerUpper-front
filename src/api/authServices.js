import { clearAuth, setAuth } from "../../redux/auth/slice";
import { store } from "../../redux/store";

let accessToken = null;
let isRefreshing = false;
let pendingQueue = [];

// BroadcastChannel for syncronization
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

export const getAccessToken = () => accessToken;

export const setAccessToken = (token, user = null) => {
  accessToken = token;
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: { "X-No-CSRF": "1" },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
    const data = await res.json();

    setAccessToken(data.accessToken);
    processQueue(null, data.accessToken);

    return data.accessToken;
  } catch (err) {
    processQueue(err, null);
    setAccessToken(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
};
