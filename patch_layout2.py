import re

filepath = 'frontend/src/components/layout/Layout.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "import { LogOut, Users, Calendar, Search, Activity } from 'lucide-react';"
replacement = "import { LogOut, Users, Calendar, Search, Activity, ClipboardList } from 'lucide-react';"
content = content.replace(target, replacement)

target2 = """    navItems.push(
      { path: '/prospects', label: 'Prospects', icon: Users },
      { path: '/market-events', label: 'Market Events', icon: Calendar }
    );"""
replacement2 = """    navItems.push(
      { path: '/prospects', label: 'Prospects', icon: Users },
      { path: '/market-events', label: 'Market Events', icon: Calendar },
      { path: '/pre-tasks', label: 'PRE Tasks', icon: ClipboardList }
    );"""
content = content.replace(target2, replacement2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
