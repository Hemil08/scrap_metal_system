import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import scrapReducer from './scrapSlice'
import inventoryReducer from './inventorySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scrap: scrapReducer,
    inventory: inventoryReducer,
    sales: salesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable checking to support complex image objects in forms easily
    })
});

export default store;