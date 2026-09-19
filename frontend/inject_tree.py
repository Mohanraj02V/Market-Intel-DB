import re

filepath = 'src/pages/ProspectDetailPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import CorporateStructureTree
if "import CorporateStructureTree" not in content:
    content = content.replace(
        "import MarketEventForm from '../components/marketEvents/MarketEventForm';",
        "import MarketEventForm from '../components/marketEvents/MarketEventForm';\nimport CorporateStructureTree from '../components/prospects/CorporateStructureTree';"
    )

# 2. Insert the tree at the bottom of the page content, just before the closing </div> of max-w-7xl
# Let's find:
#       {/* Market Events Section */}
# ... and insert it before that, or after it. Let's insert it after Market Events Section (which is at the bottom).

# Since we don't know exactly where, let's look for the Market Events Section and insert before it:
tree_section = """
      {/* Corporate Structure Tree Visualization */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Network className="text-indigo-600" /> Corporate Structure Network
        </h2>
        <CorporateStructureTree prospect={p} />
      </div>

      {/* Market Events Section */}"""

content = content.replace("      {/* Market Events Section */}", tree_section)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected CorporateStructureTree into ProspectDetailPage.jsx")
