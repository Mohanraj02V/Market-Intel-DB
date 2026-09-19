import re

filepath = 'frontend/src/pages/ProspectsPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("  const { items: marketEventsList } = useSelector((state) => state.marketEvents);\n  const [searchTerm", "  const { items: marketEventsList } = useSelector((state) => state.marketEvents);\n  const { user } = useSelector((state) => state.auth);\n  const [searchTerm")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added user selector to ProspectsPage")
