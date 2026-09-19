import re

filepath = 'backend/market_events/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'event_date'", "'start_date', 'end_date'")
content = content.replace("'-event_date'", "'-start_date'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated views.py")
