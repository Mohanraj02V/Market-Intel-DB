import re

filepath = 'frontend/src/pages/LqPipelinePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """  const fieldNames = {"""
replacement1 = """  const getFieldValue = (key) => {
    if (!selectedLq || !selectedLq.prospect) return '-';
    const p = selectedLq.prospect;
    switch (key) {
      case 'companyName': return p.company_name || '-';
      case 'country': return p.country_head_office || '-';
      case 'address': return p.complete_address || '-';
      case 'website': return p.official_website_url || '-';
      case 'linkedIn': return p.linkedin_company_page || '-';
      case 'email': return p.official_email_address || '-';
      case 'contactNo': return p.official_phone_number || '-';
      case 'productService': return p.primary_offering_type || '-';
      default: return '-';
    }
  };

  const fieldNames = {"""
content = content.replace(target1, replacement1)

target2 = """                      {Object.entries(fieldNames).map(([key, label]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <label className="text-sm font-semibold text-slate-700">{label}</label>
                          <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-sm">"""
replacement2 = """                      {Object.entries(fieldNames).map(([key, label]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <div className="flex-1 min-w-0 pr-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                            <div className="text-sm font-medium text-slate-900 truncate" title={getFieldValue(key)}>
                              {getFieldValue(key)}
                            </div>
                          </div>
                          <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-sm mt-2 sm:mt-0">"""
content = content.replace(target2, replacement2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
