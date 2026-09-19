import re

filepath = 'c:/Users/mohan/.gemini/antigravity-ide/brain/f8492126-1c3a-42d8-80d6-64c1b5ad607a/task.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("- `[ ]` **Redesign LQ Pipeline Actions**", "- `[x]` **Redesign LQ Pipeline Actions**")
content = content.replace("  - `[ ]` Define 8 verification fields state in `LqPipelinePage.jsx`", "  - `[x]` Define 8 verification fields state in `LqPipelinePage.jsx`")
content = content.replace("  - `[ ]` Replace LQ Actions UI block with the Checklist UI", "  - `[x]` Replace LQ Actions UI block with the Checklist UI")
content = content.replace("  - `[ ]` Auto-populate \"Issue Category\" and \"Details\" in Report Issue Modal", "  - `[x]` Auto-populate \"Issue Category\" and \"Details\" in Report Issue Modal")
content = content.replace("  - `[ ]` Allow multi-select or display string array in Issue Category", "  - `[x]` Allow multi-select or display string array in Issue Category")

content = content.replace("- `[ ]` **Verification**", "- `[x]` **Verification**")
content = content.replace("  - `[ ]` Verify user role selection works", "  - `[x]` Verify user role selection works")
content = content.replace("  - `[ ]` Verify Checklist updates Issue Report correctly", "  - `[x]` Verify Checklist updates Issue Report correctly")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
