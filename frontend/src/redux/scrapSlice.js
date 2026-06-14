import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { scrapAPI } from '../services/api';

const initialState = {
    records: [],
    loading: false,
    error: null
}

// Thunk to fetch scrap records
export const fetchScrapRecords = createAsyncThunk(
  'scrap/fetchRecords',
  async (filters, thunkAPI) => {
    try {
      const response = await scrapAPI.getRecords(filters);
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch scrap records';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Thunk to add a new scrap record (FormData)
export const addScrapRecord = createAsyncThunk(
  'scrap/addRecord',
  async (formData, thunkAPI) => {
    try {
      const response = await scrapAPI.createRecord(formData);
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create scrap record';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Thunk to update an existing scrap record
export const editScrapRecord = createAsyncThunk(
  'scrap/editRecord',
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await scrapAPI.updateRecord(id, formData);
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update scrap record';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Thunk to delete a scrap record
export const removeScrapRecord = createAsyncThunk(
  'scrap/removeRecord',
  async (id, thunkAPI) => {
    try {
      await scrapAPI.deleteRecord(id);
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete scrap record';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const scrapSlice = createSlice({
  name: 'scrap',
  initialState,
  reducers: {
    clearScrapError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch records
      .addCase(fetchScrapRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScrapRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchScrapRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add record
      .addCase(addScrapRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addScrapRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload); // Add new record at front of list
      })
      .addCase(addScrapRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit record
      .addCase(editScrapRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editScrapRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.records.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })
      .addCase(editScrapRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove record
      .addCase(removeScrapRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeScrapRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter(r => r._id !== action.payload);
      })
      .addCase(removeScrapRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearScrapError } = scrapSlice.actions;
export default scrapSlice.reducer;