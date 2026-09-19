import re

filepath = 'c:/Users/mohan/.gemini/antigravity-ide/brain/f8492126-1c3a-42d8-80d6-64c1b5ad607a/task.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("- `[ ]` **Backend API", "- `[x]` **Backend API")
content = content.replace("  - `[ ]` Create `backend/accounts/serializers.py`", "  - `[x]` Create `backend/accounts/serializers.py`")
content = content.replace("  - `[ ]` Add `UserViewSet`", "  - `[x]` Add `UserViewSet`")
content = content.replace("  - `[ ]` Register `UserViewSet`", "  - `[x]` Register `UserViewSet`")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
