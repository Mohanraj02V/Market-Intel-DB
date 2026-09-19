import re

filepath = 'frontend/src/features/lqPipeline/lqPipelineSlice.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "export const confirmReverification ="
replacement = """export const completePreTask = createAsyncThunk(
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

export const confirmReverification ="""

content = content.replace(target, replacement)

target2 = "reportIssueToPre.fulfilled.type, confirmReverification.fulfilled.type]"
replacement2 = "reportIssueToPre.fulfilled.type, confirmReverification.fulfilled.type, completePreTask.fulfilled.type]"
content = content.replace(target2, replacement2)

target3 = "reportIssueToPre.pending.type, confirmReverification.pending.type]"
replacement3 = "reportIssueToPre.pending.type, confirmReverification.pending.type, completePreTask.pending.type]"
content = content.replace(target3, replacement3)

target4 = "reportIssueToPre.rejected.type, confirmReverification.rejected.type]"
replacement4 = "reportIssueToPre.rejected.type, confirmReverification.rejected.type, completePreTask.rejected.type]"
content = content.replace(target4, replacement4)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
