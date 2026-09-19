import re

filepath = 'src/pages/MarketEventDetailPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'\{\/\* Participating Companies Section \*\/\}.*?</div>\s*</div>\s*</div>\s*\);\s*\};\s*export default MarketEventDetailPage;', re.DOTALL)

new_content = pattern.sub('</div>\n    </div>\n  );\n};\n\nexport default MarketEventDetailPage;', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Removed Participating Companies section")
