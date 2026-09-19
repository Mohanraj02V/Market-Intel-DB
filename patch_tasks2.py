import re

filepath = 'c:/Users/mohan/.gemini/antigravity-ide/brain/f8492126-1c3a-42d8-80d6-64c1b5ad607a/task.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("- `[ ]` **Frontend State Management", "- `[x]` **Frontend State Management")
content = content.replace("  - `[ ]` Create `frontend/src/features/users/userSlice.js`", "  - `[x]` Create `frontend/src/features/users/userSlice.js`")
content = content.replace("  - `[ ]` Register `userSlice`", "  - `[x]` Register `userSlice`")

content = content.replace("- `[ ]` **Frontend UI and Routing", "- `[x]` **Frontend UI and Routing")
content = content.replace("  - `[ ]` Update `frontend/src/router/AppRouter.jsx`", "  - `[x]` Update `frontend/src/router/AppRouter.jsx`")
content = content.replace("  - `[ ]` Update `frontend/src/components/layout/Layout.jsx`", "  - `[x]` Update `frontend/src/components/layout/Layout.jsx`")
content = content.replace("  - `[ ]` Create `frontend/src/components/users/UserForm.jsx`", "  - `[x]` Create `frontend/src/components/users/UserForm.jsx`")
content = content.replace("  - `[ ]` Create `frontend/src/pages/UserManagementPage.jsx`", "  - `[x]` Create `frontend/src/pages/UserManagementPage.jsx`")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
