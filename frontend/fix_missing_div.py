import re

filepath = 'src/pages/MarketEventDetailPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I need to change:
#     </div>
#   );
# };
#
# To:
#       </div>
#     </div>
#   );
# };

pattern = re.compile(r'    </div>\s*\);\s*\};', re.DOTALL)
new_content = pattern.sub('      </div>\n    </div>\n  );\n};', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Added missing closing div")
