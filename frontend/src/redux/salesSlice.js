import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesAPI } from '../services/api';
import { fetchInventory } from './inventorySlice'; // Import fetchInventory to trigger refresh after sale!

const initialState = {
  transactions: [],
  loading: false,
  error: null
};

// Thunk to fetch sales ledger history
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (_, thunkAPI) => {
    try {
      const response = await salesAPI.getSales();
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch sales history';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Thunk to record a new sale (and automatically re-fetch inventory!)
export const recordSale = createAsyncThunk(
  'sales/recordSale',
  async (saleData, thunkAPI) => {
    try {
      const response = await salesAPI.createSale(saleData);
      
      // Automatically refresh the inventory counts in the background
      thunkAPI.dispatch(fetchInventory());
      
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to complete sales transaction';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const salesSlice = createSlice({
    name: 'sales',
    initialState,
    reducers: {
        clearSalesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Sales
            .addCase(fetchSales.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchSales.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })

            .addCase(fetchSales.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Record Sale
            .addCase(recordSale.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(recordSale.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions.unshift(action.payload); // Prepend new transaction
            })

            .addCase(recordSale.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });    
    }
})

export const { clearSalesError } = salesSlice.actions;
export default salesSlice.reducer