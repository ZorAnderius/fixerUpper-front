import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistStore,
} from "redux-persist";
import { authReducer } from "./auth/slice";
import productsReducer from "./products/slice";
import cartReducer from "./cart/slice";
import ordersReducer from "./orders/slice";
import { authMiddleware } from "./middleware/authMiddleware";

// Конфігурація для персистенції
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'products'], // Зберігаємо auth, cart та products
  transforms: [],
  debug: true,
};

// Створюємо основний reducer
const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authMiddleware),
});

export const persistor = persistStore(store);

