import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLqPipeline, completePreTask } from '../features/lqPipeline/lqPipelineSlice';
import ProspectForm from '../components/prospects/ProspectForm';
import { AlertTriangle, CheckCircle, FileEdit, Building2 } from 'lucide-react';

const PreTasksPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.lqPipeline);
  
  const [editingProspect, setEditingProspect] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [highlightFields, setHighlightFields] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    dispatch(fetchLqPipeline({ pre_task_status: 'ISSUE_SENT_TO_PRE' }));
  }, [dispatch]);

  // Filter just in case the API didn't filter properly
  const tasks = items.filter(item => item.pre_task_status === 'ISSUE_SENT_TO_PRE');

  const handleOpenProspect = (task) => {
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
  };

  const handleCompleteTask = (lqId) => {
    dispatch(completePreTask(lqId)).then(() => {
      // Re-fetch the list to remove the completed task
      dispatch(fetchLqPipeline({ pre_task_status: 'ISSUE_SENT_TO_PRE' }));
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5" /> PRE Task Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-900 tracking-tight mb-2">Corrections & Master Data Fixes</h1>
          <p className="text-amber-700 text-sm max-w-2xl">Review and fix master data issues reported by the Lead Qualifiers.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-4">Reported Prospect</th>
                <th className="p-4">Issue Details</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500">Loading tasks...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                    No pending correction tasks!
                  </td>
                </tr>
              ) : tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{task.prospect.company_name}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {task.prospect.country_head_office} &bull; {task.prospect.primary_industries}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top max-w-md">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-900">
                      <span className="font-bold block mb-1 text-red-700">Category: {task.issue_category}</span>
                      <p className="whitespace-pre-wrap font-mono text-[10px]">{task.issue_details}</p>
                    </div>
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <button
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
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Complete Correction Task
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProspectForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        prospect={editingProspect}
        highlightFields={highlightFields}
        onSuccess={() => {
          setHasEdited(true); // Enable button on successful save
        }}
      />
    </div>
  );
};

export default PreTasksPage;
