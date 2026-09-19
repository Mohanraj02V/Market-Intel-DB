import re

filepath = 'c:/Users/mohan/.gemini/antigravity-ide/brain/f8492126-1c3a-42d8-80d6-64c1b5ad607a/task.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("- `[ ]` **Fix User Management Bug", "- `[x]` **Fix User Management Bug")
content = content.replace("  - `[ ]` Update `userSlice.js`", "  - `[x]` Update `userSlice.js`")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
