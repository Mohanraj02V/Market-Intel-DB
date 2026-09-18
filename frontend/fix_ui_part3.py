import os
import re

with open('src/pages/MarketEventsPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("events.length ===", "events?.length ===")
content = content.replace("events.map", "(events || []).map")

with open('src/pages/MarketEventsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed MarketEventsPage.jsx")
