import { createSlice } from '@reduxjs/toolkit';
import { pendingInitialState } from './initialState';

const pendingSlice = createSlice({
  name: 'pending',
  initialState: pendingInitialState,
  reducers: {
    // Зберігаємо попередню сторінку
    setPreviousLocation: (state, action) => {
      console.log('setPreviousLocation called with:', action.payload);
      state.previousLocation = action.payload;
      console.log('setPreviousLocation - state updated to:', state.previousLocation);
    },
    
    // Додаємо товар в pending кошик
    addToPendingCart: (state, action) => {
      const { productId, quantity = 1, product } = action.payload;
      
      // Перевіряємо, чи товар вже є в pending кошику
      const existingItem = state.pendingCartItems.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.pendingCartItems.push({
          productId,
          quantity,
          product: product || null, // Зберігаємо інформацію про товар
          addedAt: new Date().toISOString()
        });
      }
    },
    
    // Видаляємо товар з pending кошику
    removeFromPendingCart: (state, action) => {
      const productId = action.payload;
      state.pendingCartItems = state.pendingCartItems.filter(item => item.productId !== productId);
    },
    
    // Оновлюємо кількість товару в pending кошику
    updatePendingCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.pendingCartItems.find(item => item.productId === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.pendingCartItems = state.pendingCartItems.filter(item => item.productId !== productId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    
    // Очищаємо pending кошик
    clearPendingCart: (state) => {
      state.pendingCartItems = [];
    },
    
    // Зберігаємо товар, який користувач переглядав
    setPendingProduct: (state, action) => {
      state.pendingProduct = action.payload;
    },
    
    // Показуємо/ховаємо модальку авторизації
    setShowAuthModal: (state, action) => {
      state.showAuthModal = action.payload;
    },
    
    // Встановлюємо причину редиректу
    setRedirectReason: (state, action) => {
      state.redirectReason = action.payload;
    },
    
    // Очищаємо весь pending стан
    clearPendingState: (state) => {
      state.previousLocation = null;
      state.pendingCartItems = [];
      state.pendingProduct = null;
      state.showAuthModal = false;
      state.redirectReason = null;
    }
  }
});

export const {
  setPreviousLocation,
  addToPendingCart,
  removeFromPendingCart,
  updatePendingCartQuantity,
  clearPendingCart,
  setPendingProduct,
  setShowAuthModal,
  setRedirectReason,
  clearPendingState
} = pendingSlice.actions;

export const pendingReducer = pendingSlice.reducer;
