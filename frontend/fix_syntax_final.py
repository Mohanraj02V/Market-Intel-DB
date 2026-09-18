import os

with open('src/pages/ProspectDetailPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("return ${day}--;", "return `${day}-${month}-${year}`;")
content = content.replace("return --;", "return `${day}-${month}-${year}`;") # Just in case

with open('src/pages/ProspectDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax")
