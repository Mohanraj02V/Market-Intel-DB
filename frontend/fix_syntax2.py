import os
import re

with open('src/pages/ProspectDetailPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken interpolation syntax
content = re.sub(r'return \$\{day\}--;', 'return ${day}--;', content)

with open('src/pages/ProspectDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax")
