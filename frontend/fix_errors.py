import os

filepath = 'src/features/prospects/prospectSlice.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_create = """export const createProspect = createAsyncThunk('prospects/create', async (data) => {
  const response = await api.post('/prospects/', data);
  return response.data;
});"""

new_create = """export const createProspect = createAsyncThunk('prospects/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/prospects/', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});"""

content = content.replace(old_create, new_create)

old_update = """export const updateProspect = createAsyncThunk('prospects/update', async ({ id, data }) => {
  const response = await api.put(`/prospects/${id}/`, data);
  return response.data;
});"""

new_update = """export const updateProspect = createAsyncThunk('prospects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/prospects/${id}/`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});"""

content = content.replace(old_update, new_update)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

filepath = 'src/components/prospects/ProspectForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    form_content = f.read()

old_catch = """    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else {
          // It's a field-level error object from DRF
          const errors = [];
          for (const [field, messages] of Object.entries(err.response.data)) {
            errors.push(`${field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`);
          }
          errorMessage = errors.join(' | ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }"""

new_catch = """    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      if (err && typeof err === 'object' && !err.message) {
        if (err.detail) {
          errorMessage = err.detail;
        } else {
          const errors = [];
          for (const [field, messages] of Object.entries(err)) {
            const readableKey = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            errors.push(`${readableKey}: ${Array.isArray(messages) ? messages.join(' ') : messages}`);
          }
          errorMessage = errors.join(' | ');
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }"""

form_content = form_content.replace(old_catch, new_catch)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(form_content)

print("Fixed error handling in prospectSlice and ProspectForm")
