import { createAsyncThunk } from '@reduxjs/toolkit';
import { addToCart } from '../cart/operations';
import { 
  clearPendingState,
  addToPendingCart, 
  setRedirectReason, 
  setShowAuthModal 
} from './slice';

// Переносимо товари з pending кошику в реальний кошик після авторизації
export const transferPendingCartToCart = createAsyncThunk(
  'pending/transferPendingCartToCart',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const pendingItems = state.pending.pendingCartItems;
      
      console.log('transferPendingCartToCart - pendingItems:', pendingItems);
      console.log('transferPendingCartToCart - pendingItems length:', pendingItems.length);
      
      // Переносимо кожен товар з pending кошику в реальний кошик
      for (const item of pendingItems) {
        console.log('transferPendingCartToCart - transferring item:', item);
        try {
          await dispatch(addToCart({
            productId: item.productId,
            quantity: item.quantity
          })).unwrap();
          console.log('transferPendingCartToCart - successfully transferred item:', item.productId);
        } catch (error) {
          console.error('transferPendingCartToCart - failed to transfer item:', item.productId, error);
          // Continue with other items even if one fails
        }
      }
      
      // Очищаємо pending стан
      dispatch(clearPendingState());
      
      console.log('transferPendingCartToCart - completed, transferred:', pendingItems.length);
      return { transferredItems: pendingItems.length };
    } catch (error) {
      console.error('transferPendingCartToCart - error:', error);
      return rejectWithValue(error.message || 'Failed to transfer pending cart items');
    }
  }
);

// Додаємо товар в pending кошик та показуємо модальку авторизації
export const addToPendingCartAndShowAuth = createAsyncThunk(
  'pending/addToPendingCartAndShowAuth',
  async ({ productId, quantity = 1, product, reason = 'add_to_cart' }, { dispatch, getState }) => {
    console.log('addToPendingCartAndShowAuth called with:', { productId, quantity, product, reason });
    
    // Додаємо товар в pending кошик
    dispatch(addToPendingCart({ productId, quantity, product }));
    
    // Встановлюємо причину редиректу
    dispatch(setRedirectReason(reason));
    
    // Показуємо модальку авторизації
    dispatch(setShowAuthModal(true));
    
    // Зберігаємо в sessionStorage для fallback
    const state = getState();
    if (state.pending.previousLocation) {
      sessionStorage.setItem('previousLocation', state.pending.previousLocation);
    }
    sessionStorage.setItem('pendingItems', 'true');
    
    console.log('addToPendingCartAndShowAuth - current pending state:', state.pending);
    
    return { productId, quantity, reason };
  }
);

