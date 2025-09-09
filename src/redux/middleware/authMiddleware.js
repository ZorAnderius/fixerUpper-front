import { clearCart } from '../cart/slice';

export const authMiddleware = (store) => (next) => (action) => {
  // If clearAuth action is dispatched, also clear the cart
  if (action.type === 'auth/clearAuth') {
    store.dispatch(clearCart());
  }
  
  return next(action);
};
