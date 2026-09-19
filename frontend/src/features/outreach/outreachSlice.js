import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMailAccount = createAsyncThunk('outreach/fetchMailAccount', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/mail-account/');
        if (response.data.results && response.data.results.length > 0) {
            return response.data.results[0];
        } else if (response.data.length > 0) {
            return response.data[0];
        }
        return null;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const saveMailAccount = createAsyncThunk('outreach/saveMailAccount', async (data, { rejectWithValue }) => {
    try {
        let response;
        if (data.id) {
            response = await api.patch(`/mail-account/${data.id}/`, data);
        } else {
            response = await api.post('/mail-account/', data);
        }
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const testSmtp = createAsyncThunk('outreach/testSmtp', async (_, { rejectWithValue }) => {
    try {
        const response = await api.post('/mail-account/test-smtp/');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: 'Unknown Error' });
    }
});

export const testImap = createAsyncThunk('outreach/testImap', async (_, { rejectWithValue }) => {
    try {
        const response = await api.post('/mail-account/test-imap/');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: 'Unknown Error' });
    }
});

export const fetchCommunications = createAsyncThunk('outreach/fetchCommunications', async (prospectId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/outreach/communications/?prospect=${prospectId}`);
        // Handle paginated or non-paginated response
        return response.data.results || response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const sendOutreachEmail = createAsyncThunk('outreach/sendEmail', async (formData, { rejectWithValue }) => {
    try {
        const response = await api.post('/outreach/emails/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: 'Network Error' });
    }
});

export const recordCall = createAsyncThunk('outreach/recordCall', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/outreach/calls/', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { error: 'Network Error' });
    }
});


export const syncImap = createAsyncThunk('outreach/syncImap', async (_, { rejectWithValue }) => {
    try {
        const response = await api.post('/outreach/emails/sync_imap/');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const outreachSlice = createSlice({
    name: 'outreach',
    initialState: {
        mailAccount: null,
        communications: [],
        status: 'idle', // idle, loading, succeeded, failed
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMailAccount.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchMailAccount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.mailAccount = action.payload;
            })
            .addCase(fetchMailAccount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(saveMailAccount.fulfilled, (state, action) => {
                state.mailAccount = action.payload;
            })
            .addCase(fetchCommunications.fulfilled, (state, action) => {
                state.communications = action.payload;
            });
    }
});

export const { clearError } = outreachSlice.actions;
export default outreachSlice.reducer;
