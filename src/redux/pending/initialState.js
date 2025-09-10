export const pendingInitialState = {
  // Зберігаємо попередню сторінку
  previousLocation: null,
  
  // Зберігаємо товари, які користувач хотів додати в кошик
  pendingCartItems: [],
  
  // Зберігаємо інформацію про товар, який користувач переглядав
  pendingProduct: null,
  
  // Чи показувати модальку авторизації
  showAuthModal: false,
  
  // Додаткова інформація для редиректу
  redirectReason: null, // 'add_to_cart', 'view_product', etc.
};

