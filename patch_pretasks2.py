import re

filepath = 'frontend/src/pages/PreTasksPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "const [hasEdited, setHasEdited] = useState(false);"
replacement1 = """const [hasEdited, setHasEdited] = useState(false);
  const [highlightFields, setHighlightFields] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);"""
content = content.replace(target1, replacement1)

target2 = """  const handleOpenProspect = (prospect) => {
    setEditingProspect(prospect);
    setHasEdited(true); // Enable the "Complete Task" button once they open it
    setIsFormOpen(true);
  };"""
replacement2 = """  const handleOpenProspect = (task) => {
    setEditingProspect(task.prospect);
    setActiveTaskId(task.id);
    
    // Extract incorrect fields from the verification checklist
    const checklist = task.verification_checklist || {};
    const incorrects = Object.keys(checklist).filter(key => checklist[key] === 'Incorrect');
    
    // Map them to the formData keys used in ProspectForm
    const mapToFormKeys = {
      companyName: 'company_name',
      country: 'country_head_office',
      address: 'complete_address',
      website: 'official_website_url',
      linkedIn: 'linkedin_company_page',
      email: 'official_email_address',
      contactNo: 'official_phone_number',
      productService: 'primary_offering_type' // Or products/services/solutions
    };
    
    const mappedFields = incorrects.map(k => mapToFormKeys[k]).filter(Boolean);
    setHighlightFields(mappedFields);
    
    setHasEdited(false); // Reset to false until they actually submit the form
    setIsFormOpen(true);
  };"""
content = content.replace(target2, replacement2)

target3 = """                      <button
                        onClick={() => handleOpenProspect(task.prospect)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <FileEdit className="w-3.5 h-3.5" /> Open Prospect
                      </button>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={!hasEdited}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                          hasEdited ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >"""
replacement3 = """                      <button
                        onClick={() => handleOpenProspect(task)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <FileEdit className="w-3.5 h-3.5" /> Open Prospect
                      </button>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={!hasEdited || activeTaskId !== task.id}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                          (hasEdited && activeTaskId === task.id) ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >"""
content = content.replace(target3, replacement3)

target4 = """      <ProspectForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        prospect={editingProspect} 
      />"""
replacement4 = """      <ProspectForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        prospect={editingProspect}
        highlightFields={highlightFields}
        onSuccess={() => {
          setHasEdited(true); // Enable button on successful save
        }}
      />"""
content = content.replace(target4, replacement4)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
