import re

filepath = 'frontend/src/components/layout/Layout.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  if (user?.role === 'PRE') {
    navItems.push(
      { path: '/prospects', label: 'Prospects', icon: Users },
      { path: '/market-events', label: 'Market Events', icon: Calendar },
      { path: '/users', label: 'User Management', icon: Users }
    );
  }"""

replacement = """  if (user?.role === 'PRE') {
    navItems.push(
      { path: '/prospects', label: 'Prospects', icon: Users },
      { path: '/market-events', label: 'Market Events', icon: Calendar }
    );
  }
  
  if (user?.is_superuser) {
    navItems.push(
      { path: '/users', label: 'User Management', icon: Users }
    );
  }"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
