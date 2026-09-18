import os

with open('src/pages/ProspectDetailPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("return --;", "return ${day}--;")

with open('src/pages/ProspectDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax")
