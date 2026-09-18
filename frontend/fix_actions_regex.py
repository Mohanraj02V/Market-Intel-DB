import re

filepath = 'src/pages/ProspectsPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<div className="flex justify-end gap-3">(.*?)</div>', re.DOTALL)

new_actions = """<div className="flex justify-end gap-3 items-center">
                          <Link to={`/prospects/${prospect.id}`} className="text-emerald-600 hover:text-emerald-900" title="View Details">
                            <Eye size={18} />
                          </Link>\\1</div>"""

content = pattern.sub(new_actions, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied Regex replace to ProspectsPage.jsx")
