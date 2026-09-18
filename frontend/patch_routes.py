import os

# Update AppRouter.jsx
router_path = 'src/router/AppRouter.jsx'
with open(router_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "MarketEventsPage" not in content:
    content = content.replace(
        "import ProspectsPage from '../pages/ProspectsPage';",
        "import ProspectsPage from '../pages/ProspectsPage';\nimport MarketEventsPage from '../pages/MarketEventsPage';\nimport MarketEventDetailPage from '../pages/MarketEventDetailPage';"
    )
    content = content.replace(
        "<Route path=\"/prospects/:id\" element={<ProspectDetailPage />} />",
        "<Route path=\"/prospects/:id\" element={<ProspectDetailPage />} />\n            <Route path=\"/market-events\" element={<MarketEventsPage />} />\n            <Route path=\"/market-events/:id\" element={<MarketEventDetailPage />} />"
    )
    with open(router_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update Layout.jsx
layout_path = 'src/components/layout/Layout.jsx'
with open(layout_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "/market-events" not in content:
    content = content.replace("Building2, Users, Settings", "Building2, Users, Settings, Calendar")
    
    new_nav = """const navigation = [
    { name: 'Prospects', href: '/prospects', icon: Building2 },
    { name: 'Market Events', href: '/market-events', icon: Calendar },
    { name: 'Users', href: '#', icon: Users, current: false },
    { name: 'Settings', href: '#', icon: Settings, current: false },
  ];"""
    
    old_nav = """const navigation = [
    { name: 'Prospects', href: '/prospects', icon: Building2 },
    { name: 'Users', href: '#', icon: Users, current: false },
    { name: 'Settings', href: '#', icon: Settings, current: false },
  ];"""
    
    content = content.replace(old_nav, new_nav)
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated AppRouter and Layout")
