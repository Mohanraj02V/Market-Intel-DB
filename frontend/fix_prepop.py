import os

with open('src/components/prospects/ProspectForm.jsx', 'r', encoding='utf-8') as f:
    form_content = f.read()

old_edit_state = """        services: prospect.services || [],
        solutions: prospect.solutions || [],
        key_contacts: prospect.key_contacts || [],
        market_event_ids: prospect.market_event_ids || []"""

new_edit_state = """        services: prospect.services || [],
        solutions: prospect.solutions || [],
        key_contacts: prospect.key_contacts || [],
        market_event_ids: (prospect.market_events || []).map(e => e.id)"""

form_content = form_content.replace(old_edit_state, new_edit_state)

with open('src/components/prospects/ProspectForm.jsx', 'w', encoding='utf-8') as f:
    f.write(form_content)

print("Fixed pre-population of market events in ProspectForm.jsx")
