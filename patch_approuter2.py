import re

filepath = 'frontend/src/router/AppRouter.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
content = content.replace("import UserManagementPage from '../pages/UserManagementPage';", "import UserManagementPage from '../pages/UserManagementPage';\nimport PreTasksPage from '../pages/PreTasksPage';")

# 2. Add Route
target_route = "<Route path=\"market-events/:id\" element={<RoleRoute allowedRoles={['PRE']}><MarketEventDetailPage /></RoleRoute>} />"
new_route = target_route + "\n          <Route path=\"pre-tasks\" element={<RoleRoute allowedRoles={['PRE']}><PreTasksPage /></RoleRoute>} />"
content = content.replace(target_route, new_route)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
