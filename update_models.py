import re
import datetime

filepath = 'backend/market_events/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import datetime if not exists
if 'import datetime' not in content:
    content = 'import datetime\n' + content

# Replace event_date with start_date and end_date
content = content.replace(
    '    event_date = models.DateField()',
    '    start_date = models.DateField(default=datetime.date.today)\n    end_date = models.DateField(default=datetime.date.today)'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated models.py")
