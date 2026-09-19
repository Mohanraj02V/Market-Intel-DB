import re

filepath = 'frontend/src/pages/LqPipelinePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add verification checklist state
checklist_state = """  const [verificationFields, setVerificationFields] = useState({
    companyName: 'Correct',
    country: 'Correct',
    address: 'Correct',
    website: 'Correct',
    linkedIn: 'Correct',
    email: 'Correct',
    contactNo: 'Correct',
    productService: 'Correct'
  });"""

content = content.replace("  const [showIssueModal, setShowIssueModal] = useState(false);", "  const [showIssueModal, setShowIssueModal] = useState(false);\n" + checklist_state)

# 2. Modify handleReportIssue click to open modal AND populate fields
report_issue_fn = """  const handleOpenIssueModal = () => {
    const incorrectFields = Object.keys(verificationFields).filter(key => verificationFields[key] === 'Incorrect');
    
    // Map internal keys to display names
    const fieldNames = {
      companyName: 'Company Name',
      country: 'Country',
      address: 'Address',
      website: 'Website',
      linkedIn: 'LinkedIn Page',
      email: 'Official Email',
      contactNo: 'Contact No.',
      productService: 'Product, Service & Solution'
    };
    
    const incorrectNames = incorrectFields.map(key => fieldNames[key]);
    
    if (incorrectNames.length > 0) {
      setIssueCategory(incorrectNames.join(', '));
      setIssueDetails(`The following fields are incorrect and need to be fixed by PRE:\n- ${incorrectNames.join('\\n- ')}`);
    } else {
      setIssueCategory('');
      setIssueDetails('');
    }
    setShowIssueModal(true);
  };"""

content = content.replace("  const openWorkspace = (lq) => {", report_issue_fn + "\n\n  const openWorkspace = (lq) => {")
content = content.replace("onClick={() => setShowIssueModal(true)}", "onClick={handleOpenIssueModal}")

# 3. Modify openWorkspace to reset checklist
open_workspace_reset = """    setVerificationFields({
      companyName: 'Correct',
      country: 'Correct',
      address: 'Correct',
      website: 'Correct',
      linkedIn: 'Correct',
      email: 'Correct',
      contactNo: 'Correct',
      productService: 'Correct'
    });
    setShowWorkspace(true);"""

content = content.replace("setShowWorkspace(true);", open_workspace_reset)

# 4. Replace the "LQ Actions" UI block
lq_actions_block = """{/* Qualification Form */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Verification Checklist</h3>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {[
                        { key: 'companyName', label: 'Company Name' },
                        { key: 'country', label: 'Country' },
                        { key: 'address', label: 'Address' },
                        { key: 'website', label: 'Website' },
                        { key: 'linkedIn', label: 'LinkedIn Page' },
                        { key: 'email', label: 'Official Email' },
                        { key: 'contactNo', label: 'Contact No.' },
                        { key: 'productService', label: 'Product, Service & Solution' }
                      ].map(field => (
                        <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          <label className="text-sm font-semibold text-slate-700">{field.label}</label>
                          <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                            <button
                              type="button"
                              onClick={() => setVerificationFields({...verificationFields, [field.key]: 'Correct'})}
                              className={`px-3 py-1.5 text-xs font-bold transition ${verificationFields[field.key] === 'Correct' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                              Correct
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerificationFields({...verificationFields, [field.key]: 'Incorrect'})}
                              className={`px-3 py-1.5 text-xs font-bold transition border-l border-slate-200 ${verificationFields[field.key] === 'Incorrect' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                              Incorrect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>"""

# Remove old LQ Actions block
content = re.sub(r'\{/\* Qualification Form \*/\}.*?(?=</form>|</div>\s*</div>\s*</div>\s*<div className="p-4 border-t)', lq_actions_block + '\n              </div>\n            </div>', content, flags=re.DOTALL)

# 5. Modify Issue Modal
issue_category_block = """                <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Category</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" value={issueCategory} onChange={e => setIssueCategory(e.target.value)} placeholder="e.g. Incorrect Company Name, Address..." />"""

content = re.sub(r'<label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Category</label>.*?</select>', issue_category_block, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
