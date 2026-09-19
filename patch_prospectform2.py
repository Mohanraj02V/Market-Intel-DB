import re

filepath = 'frontend/src/components/prospects/ProspectForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "const ProspectForm = ({ isOpen, onClose, prospect = null }) => {"
replacement1 = "const ProspectForm = ({ isOpen, onClose, prospect = null, highlightFields = [], onSuccess = null }) => {"
content = content.replace(target1, replacement1)

target2 = """      if (prospect) {
        await dispatch(updateProspect({ id: prospect.id, data: cleanData })).unwrap();
      } else {
        await dispatch(createProspect(cleanData)).unwrap();
      }
      onClose();"""
replacement2 = """      if (prospect) {
        await dispatch(updateProspect({ id: prospect.id, data: cleanData })).unwrap();
      } else {
        await dispatch(createProspect(cleanData)).unwrap();
      }
      if (onSuccess) onSuccess();
      onClose();"""
content = content.replace(target2, replacement2)

# Helper function to inject class logic for highlights
def patch_input(field_name, content_str):
    # Find the input/select/textarea for this field
    pattern = rf'(name="{field_name}"[^>]*className=")([^"]+)(")'
    def repl(m):
        prefix = m.group(1)
        classes = m.group(2)
        suffix = m.group(3)
        # We replace the static className string with a template literal string
        # BUT wait, the inputs in JSX are already string literals.
        # Let's just do a simple replacement if it's currently a string literal.
        if "className={" not in prefix:
            new_class = classes.replace("border-slate-300", "").replace("border ", "").replace("focus:border-indigo-500 focus:ring-indigo-500", "")
            return f'className={{`{new_class} ${{highlightFields?.includes(\'{field_name}\') ? \'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500\' : \'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500\'}}`}}'
        return m.group(0)
    return re.sub(pattern, repl, content_str)

fields_to_patch = [
    'company_name',
    'country_head_office',
    'complete_address',
    'official_phone_number',
    'official_email_address',
    'official_website_url',
    'linkedin_company_page',
    'primary_industries'
]

for field in fields_to_patch:
    content = patch_input(field, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
