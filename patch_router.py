import re

filepath = 'frontend/src/router/AppRouter.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("<Route path=\"prospects\" element={<RoleRoute allowedRoles={['PRE']}><ProspectsPage /></RoleRoute>} />", "<Route path=\"prospects\" element={<RoleRoute allowedRoles={['PRE', 'LQ']}><ProspectsPage /></RoleRoute>} />")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AppRouter.jsx to allow LQ on prospects list")
