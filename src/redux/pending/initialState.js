export const pendingInitialState = {
  // Store previous page
  previousLocation: null,
  
  // Store items that user wanted to add to cart
  pendingCartItems: [],
  
  // Store information about product that user was viewing
  pendingProduct: null,
  
  // Whether to show authentication modal
  showAuthModal: false,
  
  // Additional information for redirect
  redirectReason: null, // 'add_to_cart', 'view_product', etc.
};

