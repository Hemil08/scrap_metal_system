import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

// Retrieve cached auth state from localStorage
const storedToken = localStorage.getItem('token');
let storedUser = null;
try {
  const userStr = localStorage.getItem('user');
  if (userStr) storedUser = JSON.parse(userStr);
} catch (e) {
  console.error('Failed to parse cached user object');
}

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null
};

// Async Thunk for User Login
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await authAPI.login(credentials);
    const { token, ...userData } = response.data.data;
    
    // Cache inside localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { token, user: userData };
  } catch (error) {
    const msg = error.response?.data?.message || 'Login failed, check credentials';
    return thunkAPI.rejectWithValue(msg);
  }
});

// Async Thunk for User Registration
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await authAPI.register(userData);
    const { token, ...data } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return { token, user: data };
  } catch (error) {
    const msg = error.response?.data?.message || 'Registration failed';
    return thunkAPI.rejectWithValue(msg);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
