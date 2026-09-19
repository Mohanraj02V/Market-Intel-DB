import re

filepath = 'src/pages/MarketEventsPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '                  <th className="px-6 py-4">Event Date</th>',
    '                  <th className="px-6 py-4">Date Range</th>'
)

# In the table row:
# <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
#   {new Date(event.event_date).toLocaleDateString()}
# </td>
# I need to change this to:
# <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
#   {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
# </td>

old_td = """                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(event.event_date).toLocaleDateString()}
                      </td>"""

new_td = """                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                      </td>"""

content = content.replace(old_td, new_td)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MarketEventsPage.jsx")
