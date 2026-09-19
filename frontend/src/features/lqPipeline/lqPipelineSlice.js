import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLqPipeline = createAsyncThunk(
  'lqPipeline/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/lq-pipeline/', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchLqPipelineItem = createAsyncThunk(
  'lqPipeline/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lq-pipeline/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVerification = createAsyncThunk(
  'lqPipeline/updateVerification',
  async ({ id, verification_status }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lq-pipeline/${id}/verify/`, { verification_status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitQualification = createAsyncThunk(
  'lqPipeline/submitQualification',
  async ({ id, ...qualificationData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lq-pipeline/${id}/qualification/`, qualificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reportIssueToPre = createAsyncThunk(
  'lqPipeline/reportIssue',
  async ({ id, issueData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lq-pipeline/${id}/report-issue/`, issueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const completePreTask = createAsyncThunk(
  'lqPipeline/completePreTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lq-pipeline/${id}/complete-pre-task/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const confirmReverification = createAsyncThunk(
  'lqPipeline/confirmReverification',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lq-pipeline/${id}/confirm-reverification/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const lqPipelineSlice = createSlice({
  name: 'lqPipeline',
  initialState: {
    items: [],
    selectedItem: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchLqPipeline.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLqPipeline.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.results || action.payload; })
      .addCase(fetchLqPipeline.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // fetch one
      .addCase(fetchLqPipelineItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLqPipelineItem.fulfilled, (state, action) => { state.loading = false; state.selectedItem = action.payload; })
      .addCase(fetchLqPipelineItem.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // actions that update a single item in the list/selectedItem
      .addMatcher(
        (action) => [updateVerification.fulfilled.type, submitQualification.fulfilled.type, reportIssueToPre.fulfilled.type, confirmReverification.fulfilled.type, completePreTask.fulfilled.type].includes(action.type),
        (state, action) => {
          state.loading = false;
          if (state.selectedItem && state.selectedItem.id === action.payload.id) {
            state.selectedItem = action.payload;
          }
          const index = state.items.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )
      // common pending for actions
      .addMatcher(
        (action) => [updateVerification.pending.type, submitQualification.pending.type, reportIssueToPre.pending.type, confirmReverification.pending.type, completePreTask.pending.type].includes(action.type),
        (state) => { state.loading = true; state.error = null; }
      )
      // common rejected for actions
      .addMatcher(
        (action) => [updateVerification.rejected.type, submitQualification.rejected.type, reportIssueToPre.rejected.type, confirmReverification.rejected.type, completePreTask.rejected.type].includes(action.type),
        (state, action) => { state.loading = false; state.error = action.payload; }
      );
  }
});

export const { clearSelectedItem } = lqPipelineSlice.actions;
export default lqPipelineSlice.reducer;
