import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProspects = createAsyncThunk('prospects/fetchAll', async (params) => {
  const response = await api.get('/prospects/', { params });
  return response.data;
});

export const fetchProspectById = createAsyncThunk('prospects/fetchById', async (id) => {
  const response = await api.get(`/prospects/${id}/`);
  return response.data;
});

export const createProspect = createAsyncThunk('prospects/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/prospects/', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateProspect = createAsyncThunk('prospects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/prospects/${id}/`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteProspect = createAsyncThunk('prospects/delete', async (id) => {
  await api.delete(`/prospects/${id}/`);
  return id;
});

const initialState = {
  items: [],
  count: 0,
  next: null,
  previous: null,
  selectedProspect: null,
  loading: false,
  error: null,
  filters: {},
  search: '',
  page: 1,
};

const prospectSlice = createSlice({
  name: 'prospects',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.page = 1;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearSelectedProspect: (state) => {
      state.selectedProspect = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProspects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProspects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
        state.count = action.payload.count || action.payload.length;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchProspects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProspectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProspectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProspect = action.payload;
      })
      .addCase(fetchProspectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch prospect details";
      })
      .addCase(createProspect.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.count += 1;
      })
      .addCase(updateProspect.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProspect?.id === action.payload.id) {
          state.selectedProspect = action.payload;
        }
      })
      .addCase(deleteProspect.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.count -= 1;
      });
  },
});

export const { setFilters, setSearch, setPage, clearSelectedProspect } = prospectSlice.actions;
export default prospectSlice.reducer;
