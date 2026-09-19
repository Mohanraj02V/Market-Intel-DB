import re

filepath = 'frontend/src/router/AppRouter.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update RoleRoute to accept requireAdmin
new_role_route = """const RoleRoute = ({ children, allowedRoles, requireAdmin }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requireAdmin && !user?.is_superuser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {"""

content = content.replace("""const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (user && !allowedRoles.includes(user.role)) {""", new_role_route)

# 2. Update the users route to requireAdmin
content = content.replace(
    "<Route path=\"users\" element={<RoleRoute allowedRoles={['PRE']}><UserManagementPage /></RoleRoute>} />",
    "<Route path=\"users\" element={<RoleRoute requireAdmin={true}><UserManagementPage /></RoleRoute>} />"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
