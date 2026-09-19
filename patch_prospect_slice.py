import re

filepath = 'frontend/src/features/prospects/prospectSlice.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

rejected_case = """      .addCase(fetchProspectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProspect = action.payload;
      })
      .addCase(fetchProspectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch prospect details";
      })"""

content = content.replace("      .addCase(fetchProspectById.fulfilled, (state, action) => {\n        state.loading = false;\n        state.selectedProspect = action.payload;\n      })", rejected_case)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added fetchProspectById.rejected to prospectSlice.js")
