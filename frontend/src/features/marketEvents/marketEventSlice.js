import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMarketEvents = createAsyncThunk(
  'marketEvents/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/market-events/', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchMarketEvent = createAsyncThunk(
  'marketEvents/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/market-events/${id}/`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createMarketEvent = createAsyncThunk(
  'marketEvents/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/market-events/', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateMarketEvent = createAsyncThunk(
  'marketEvents/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/market-events/${id}/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteMarketEvent = createAsyncThunk(
  'marketEvents/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/market-events/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const marketEventSlice = createSlice({
  name: 'marketEvents',
  initialState: {
    items: [],
    selectedMarketEvent: null,
    loading: false,
    error: null,
    count: 0,
    search: '',
  },
  reducers: {
    clearSelectedMarketEvent: (state) => {
      state.selectedMarketEvent = null;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchMarketEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Supports DRF pagination
        if (action.payload.results) {
          state.items = action.payload.results;
          state.count = action.payload.count;
        } else {
          state.items = action.payload;
          state.count = action.payload.length;
        }
      })
      .addCase(fetchMarketEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch one
      .addCase(fetchMarketEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMarketEvent = action.payload;
      })
      .addCase(fetchMarketEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createMarketEvent.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.count += 1;
      })
      // Update
      .addCase(updateMarketEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedMarketEvent?.id === action.payload.id) {
          state.selectedMarketEvent = action.payload;
        }
      })
      // Delete
      .addCase(deleteMarketEvent.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.count -= 1;
        if (state.selectedMarketEvent?.id === action.payload) {
          state.selectedMarketEvent = null;
        }
      });
  },
});

export const { clearSelectedMarketEvent, setSearch } = marketEventSlice.actions;
export default marketEventSlice.reducer;
