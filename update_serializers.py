import re

filepath = 'backend/market_events/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace event_date with start_date, end_date in fields list
content = content.replace("'event_date'", "'start_date', 'end_date'")
content = content.replace('"event_date"', '"start_date", "end_date"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated serializers.py")
