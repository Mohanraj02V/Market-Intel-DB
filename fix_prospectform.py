import re

filepath = 'frontend/src/components/prospects/ProspectForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix for standard inputs
def fix_input(field_name, content_str):
    pattern = rf'(<input type="[^"]+" )className={{\`([^\`]+) \$\{{highlightFields\?\.includes\(\'{field_name}\'\)'
    def repl(m):
        prefix = m.group(1)
        classes = m.group(2)
        return f'{prefix}name="{field_name}" value={{formData.{field_name}}} onChange={{handleChange}} className={{`{classes} ${{highlightFields?.includes(\'{field_name}\')'
    return re.sub(pattern, repl, content_str)

# Fix for textarea
def fix_textarea(field_name, content_str):
    pattern = rf'(<textarea )className={{\`([^\`]+) \$\{{highlightFields\?\.includes\(\'{field_name}\'\)'
    def repl(m):
        prefix = m.group(1)
        classes = m.group(2)
        return f'{prefix}name="{field_name}" rows="2" value={{formData.{field_name}}} onChange={{handleChange}} className={{`{classes} ${{highlightFields?.includes(\'{field_name}\')'
    return re.sub(pattern, repl, content_str)

fields_to_patch = [
    'company_name',
    'country_head_office',
    'official_phone_number',
    'official_email_address',
    'official_website_url',
    'linkedin_company_page',
    'primary_industries'
]

for field in fields_to_patch:
    content = fix_input(field, content)

content = fix_textarea('complete_address', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
