import os

def fix_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix import paths
    content = content.replace("../../features/marketEvents", "../features/marketEvents")
    content = content.replace("../../components/marketEvents", "../components/marketEvents")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_imports('src/pages/MarketEventsPage.jsx')
fix_imports('src/pages/MarketEventDetailPage.jsx')

# MarketEventForm is in src/components/marketEvents/
# It should import from '../../features/marketEvents/marketEventSlice' which is correct because it's 2 levels deep!
# Wait, MarketEventForm is in src/components/marketEvents/.
# So ../../features... goes up to src, then into eatures. That is CORRECT for MarketEventForm!

# ProspectForm is in src/components/prospects/.
# It imports ../../features/marketEvents... which is correct.

# Now let's fix ProspectDetailPage interpolation issue
with open('src/pages/ProspectDetailPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken string
content = content.replace("return --;", "return ${day}--;")
with open('src/pages/ProspectDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed imports and syntax")
