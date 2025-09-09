/**
 * Helper function to handle redirect after authentication
 * Checks for pending cart item and redirects to the appropriate page
 */

export const redirectAfterAuth = (navigate, fallbackRoute = '/') => {
  const pendingCartItem = localStorage.getItem('pendingCartItem');
  
  if (pendingCartItem) {
    try {
      const cartData = JSON.parse(pendingCartItem);
      // Return to product page
      navigate(cartData.returnUrl || fallbackRoute);
    } catch (error) {
      console.error('Failed to parse pending cart item:', error);
      navigate(fallbackRoute);
    }
  } else {
    navigate(fallbackRoute);
  }
};

/**
 * Helper function to handle redirect with error state
 */
export const redirectAfterAuthWithError = (navigate, errorMessage, fallbackRoute = '/') => {
  const pendingCartItem = localStorage.getItem('pendingCartItem');
  
  if (pendingCartItem) {
    try {
      const cartData = JSON.parse(pendingCartItem);
      // Return to product page with error
      navigate(cartData.returnUrl || fallbackRoute, { 
        state: { error: errorMessage }
      });
    } catch (error) {
      console.error('Failed to parse pending cart item:', error);
      navigate(fallbackRoute, { 
        state: { error: errorMessage }
      });
    }
  } else {
    navigate(fallbackRoute, { 
      state: { error: errorMessage }
    });
  }
};


