import os

with open('src/components/prospects/ProspectForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix handleMarketEventToggle
old_toggle = """  const handleMarketEventToggle = (eventId) => {
    setFormData(prev => {
      const isSelected = prev.market_event_ids.includes(eventId);
      return {
        ...prev,
        market_event_ids: isSelected 
          ? prev.market_event_ids.filter(id => id !== eventId)
          : [...prev.market_event_ids, eventId]
      };
    });
  };"""

new_toggle = """  const handleMarketEventToggle = (eventId) => {
    setFormData(prev => {
      const currentIds = prev.market_event_ids || [];
      const isSelected = currentIds.includes(eventId);
      return {
        ...prev,
        market_event_ids: isSelected 
          ? currentIds.filter(id => id !== eventId)
          : [...currentIds, eventId]
      };
    });
  };"""

content = content.replace(old_toggle, new_toggle)

# Fix initial states
old_initial_state = """    company_structure: 'Parent',
    operational_status: 'Active',
    parent_companies: [],
    status_target: '',
    primary_offering_type: 'Multiple',
    products: [],
    services: [],
    solutions: [],
    key_contacts: []"""

new_initial_state = """    company_structure: 'Parent',
    operational_status: 'Active',
    parent_companies: [],
    status_target: '',
    primary_offering_type: 'Multiple',
    products: [],
    services: [],
    solutions: [],
    key_contacts: [],
    market_event_ids: []"""

content = content.replace(old_initial_state, new_initial_state)

old_edit_state = """        services: prospect.services || [],
        solutions: prospect.solutions || [],
        key_contacts: prospect.key_contacts || []"""

new_edit_state = """        services: prospect.services || [],
        solutions: prospect.solutions || [],
        key_contacts: prospect.key_contacts || [],
        market_event_ids: prospect.market_event_ids || []"""

content = content.replace(old_edit_state, new_edit_state)

old_new_state = """        products: [], services: [], solutions: [], key_contacts: []"""
new_new_state = """        products: [], services: [], solutions: [], key_contacts: [], market_event_ids: []"""

content = content.replace(old_new_state, new_new_state)

with open('src/components/prospects/ProspectForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed handleMarketEventToggle and initial states")
