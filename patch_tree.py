import re

filepath = 'frontend/src/pages/ProspectDetailPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "import CorporateStructureTree from" not in content:
    content = content.replace("import { ArrowLeft", "import CorporateStructureTree from '../components/prospects/CorporateStructureTree';\nimport { ArrowLeft")

tree_block = """            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Network size={20} className="text-indigo-500" /> Corporate Structure
              </h3>
            </div>
            <div className="p-6">
              <CorporateStructureTree prospect={p} />
            </div>"""

content = re.sub(
    r'<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">\s*<h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">\s*<Network size=\{20\} className="text-indigo-500" /> Corporate Structure\s*</h3>\s*</div>\s*<div className="p-6">.*?</div>\s*</div>\s*</div>\s*<div className="bg-white',
    tree_block + '\n          </div>\n\n          <div className="bg-white',
    content,
    flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Restored CorporateStructureTree to ProspectDetailPage")
