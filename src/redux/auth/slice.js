import { createSlice } from "@reduxjs/toolkit";
import initialState from "./initialState";
import { responseStatuses } from "../../helpers/constants/responseStatus";
import { clearCart } from "../cart/slice";
import { registerUser, loginUser, logoutUser, getCurrentUser, updateUserAvatar, authenticateWithGoogleOAuth } from "./operations";

const sliceAuth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.status = responseStatuses.SUCCEEDED;
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.status = responseStatuses.IDLE;
      state.error = null;
    },
    setLoading(state) {
      state.status = responseStatuses.LOADING;
    },
    setError(state, action) {
      state.status = responseStatuses.FAILED;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = responseStatuses.IDLE;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.status = responseStatuses.LOADING;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.status = responseStatuses.SUCCEEDED;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = responseStatuses.FAILED;
        state.error = action.payload;
      })
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.status = responseStatuses.LOADING;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.status = responseStatuses.SUCCEEDED;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = responseStatuses.FAILED;
        state.error = action.payload;
      })
      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.status = responseStatuses.LOADING;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = responseStatuses.IDLE;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = responseStatuses.FAILED;
        state.error = action.payload;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.status = responseStatuses.LOADING;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.status = responseStatuses.SUCCEEDED;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = responseStatuses.FAILED;
        state.error = action.payload;
      })
      // Update user avatar
      .addCase(updateUserAvatar.pending, (state) => {
        state.status = responseStatuses.LOADING;
        state.error = null;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.status = responseStatuses.SUCCEEDED;
        state.error = null;
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.status = responseStatuses.FAILED;
        state.error = action.payload;
      })
      // Google OAuth authentication
      .addCase(authenticateWithGoogleOAuth.pending, (state) => {
        state.status = responseStatuses.LOADING;
        state.error = null;
      })
      .addCase(authenticateWithGoogleOAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.status = responseStatuses.SUCCEEDED;
        state.error = null;
      })
      .addCase(authenticateWithGoogleOAuth.rejected, (state, action) => {
        state.status = responseStatuses.FAILED;
        state.error = action.payload;
      });
  },
});

export const { setAuth, clearAuth, setLoading, setError, clearError, resetStatus } = sliceAuth.actions;
export const authReducer = sliceAuth.reducer;
