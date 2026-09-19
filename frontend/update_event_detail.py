import re

filepath = 'src/pages/MarketEventDetailPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_date_display = """                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(event.event_date)}
                </div>"""

new_date_display = """                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </div>"""

content = content.replace(old_date_display, new_date_display)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MarketEventDetailPage.jsx")
