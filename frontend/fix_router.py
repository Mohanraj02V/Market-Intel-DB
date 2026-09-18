import os

file_path = 'src/router/AppRouter.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_routes = """          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="prospects/:id" element={<ProspectDetailPage />} />"""

new_routes = """          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="prospects/:id" element={<ProspectDetailPage />} />
          <Route path="market-events" element={<MarketEventsPage />} />
          <Route path="market-events/:id" element={<MarketEventDetailPage />} />"""

content = content.replace(old_routes, new_routes)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed AppRouter.jsx")
