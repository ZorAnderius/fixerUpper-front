export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthStatus = (state) => state.auth.status;

// Role selectors
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsAdmin = (state) => state.auth.user?.role === 'administrator';
export const selectIsModerator = (state) => state.auth.user?.role === 'moderator';
export const selectIsCustomer = (state) => state.auth.user?.role === 'customer';