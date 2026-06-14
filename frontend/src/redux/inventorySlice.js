import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryAPI } from '../services/api';

const initialState = {
  items: [],
  loading: false,
  error: null
};

// Thunk to fetch inventory levels
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, thunkAPI) => {
    try {
      const response = await inventoryAPI.getInventory();
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch inventory levels';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Thunk to adjust stock quantity manually
export const adjustInventory = createAsyncThunk(
  'inventory/adjustStock',
  async ({ id, quantity }, thunkAPI) => {
    try {
      const response = await inventoryAPI.updateStock(id, quantity);
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to adjust inventory stock';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Adjust stock
      .addCase(adjustInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustInventory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(adjustInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;