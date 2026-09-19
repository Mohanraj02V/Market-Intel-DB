import re

filepath = 'frontend/src/features/users/userSlice.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "state.items = action.payload;",
    "state.items = action.payload.results || action.payload;"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
