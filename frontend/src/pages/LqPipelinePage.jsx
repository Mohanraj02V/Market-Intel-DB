import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Building2, AlertTriangle, CheckCircle, Phone, Search, 
  CheckCircle2, AlertCircle, PlayCircle, RefreshCw,
  FileEdit, Mail, XCircle
} from 'lucide-react';
import { 
  fetchLqPipeline, 
  updateVerification, 
  reportIssueToPre, 
  confirmReverification 
} from '../features/lqPipeline/lqPipelineSlice';
import { Link } from 'react-router-dom';
import LqWorkspaceModal from '../components/lq/LqWorkspaceModal';

const LqPipelinePage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.lqPipeline);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  
  const [selectedLq, setSelectedLq] = useState(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [verificationFields, setVerificationFields] = useState({
    companyName: null,
    country: null,
    address: null,
    website: null,
    linkedIn: null,
    email: null,
    contactNo: null,
    productService: null
  });

  useEffect(() => {
    dispatch(fetchLqPipeline());
  }, [dispatch]);

  const filteredItems = items.filter(item => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Issue Sent to PRE' && item.pre_task_status !== 'ISSUE_SENT_TO_PRE') return false;
      if (statusFilter !== 'Issue Sent to PRE' && item.verification_status !== statusFilter) return false;
    }
    if (verificationFilter !== 'All' && item.verification_status !== verificationFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const p = item.prospect;
      return p.company_name?.toLowerCase().includes(s) || 
             p.country_head_office?.toLowerCase().includes(s) || 
             p.primary_industries?.toLowerCase().includes(s);
    }
    return true;
  });

  const pipelineCount = items.length;
  const preIssuesCount = items.filter(i => i.pre_task_status === 'ISSUE_SENT_TO_PRE').length;
  const verifiedCount = items.filter(i => i.verification_status === 'Verified').length;
  const totalOutreachLogsCount = 0;

  const openWorkspace = (lq) => {
    setSelectedLq(lq);
    const savedChecklist = lq.verification_checklist || {};
    setVerificationFields({
      companyName: savedChecklist.companyName || 'Correct',
      country: savedChecklist.country || 'Correct',
      address: savedChecklist.address || 'Correct',
      website: savedChecklist.website || 'Correct',
      linkedIn: savedChecklist.linkedIn || 'Correct',
      email: savedChecklist.email || 'Correct',
      contactNo: savedChecklist.contactNo || 'Correct',
      productService: savedChecklist.productService || 'Correct'
    });
    setShowWorkspace(true);
  };

  const handleFieldToggle = (key, value) => {
    setVerificationFields(prev => ({ ...prev, [key]: value }));
  };

  // Derive issue status
  const incorrectFields = Object.keys(verificationFields).filter(key => verificationFields[key] === 'Incorrect');
  const allCorrect = Object.keys(verificationFields).every(key => verificationFields[key] === 'Correct');
  const hasIncorrect = incorrectFields.length > 0;
  
  const getFieldValue = (key) => {
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
  const autoCategory = incorrectNames.join(', ');
  const autoDetails = incorrectNames.length > 0 ? `The following fields are incorrect and need to be fixed by PRE:\n- ${incorrectNames.join('\n- ')}` : '';

  const handleSubmitIssue = () => {
    dispatch(reportIssueToPre({
      id: selectedLq.id,
      issueData: {
        issue_category: autoCategory,
        issue_details: autoDetails,
        verification_checklist: verificationFields
      }
    }));
    setShowWorkspace(false);
  };

  const handleReadyForOutreach = () => {
    dispatch(updateVerification({ 
      id: selectedLq.id, 
      verification_status: 'Verified',
      verification_checklist: verificationFields 
    }));
    setShowWorkspace(false);
  };

  const handleConfirmReverify = (item) => {
    dispatch(confirmReverification(item.id)).then((action) => {
      if (action.payload) {
        openWorkspace(action.payload);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> LQ Module: PRE Master Data Connected
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Lead Verification & Outreach Workspace</h1>
          <p className="text-slate-400 text-sm max-w-2xl">Review and verify prospect master data, qualify opportunities, and continue the lead qualification workflow.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">LQ Pipeline Prospects</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{pipelineCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Issues Sent to PRE</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-1">{preIssuesCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Verified Prospects</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{verifiedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Outreach Activities</span>
            <Phone className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-800 mt-1">{totalOutreachLogsCount}</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by master prospect name, country, industry..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="All">All Statuses</option>
                <option value="Unverified">Unverified</option>
                <option value="In Progress">In Progress</option>
                <option value="Verified">Verified</option>
              </select>
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Master Prospect & PRE Data</th>
                <th className="p-3.5">PRE Task Status</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const p = item.prospect;
                const isIssue = item.pre_task_status === 'ISSUE_SENT_TO_PRE';
                const isUpdated = item.pre_task_status === 'PRE_UPDATED';
                const isBudgetFrozen = item.qualification_status === 'Budget Frozen';
                const isLeadQualified = item.qualification_status === 'Lead Qualified';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <Link to={`/lq-pipeline/${item.id}`} className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-sm transition">
                            {p.company_name}
                          </Link>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {p.country_head_office} &bull; {p.primary_industries}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {isIssue && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Issue Sent to PRE
                        </span>
                      )}
                      {isUpdated && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[10px]">
                          <RefreshCw className="w-3 h-3 text-emerald-500" /> PRE Updated Data
                        </span>
                      )}
                      {!isIssue && !isUpdated && <span className="text-slate-400 italic text-[10px]">None</span>}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[10px] border ${
                        item.verification_status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {item.verification_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {isUpdated ? (
                        <button
                          onClick={() => handleConfirmReverify(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle className="w-3 h-3" /> Confirm Fixes
                        </button>
                      ) : (
                        <button
                          onClick={() => openWorkspace(item)}
                          disabled={isBudgetFrozen}
                          title={isBudgetFrozen ? 'Outreach disabled — Prospect is Budget Frozen' : ''}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold transition flex items-center gap-1 ml-auto ${
                            isBudgetFrozen ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 
                            isIssue ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                            item.verification_status === 'Verified' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 
                            'bg-slate-800 hover:bg-slate-900 text-white'
                          }`}
                        >
                          {isBudgetFrozen ? (
                            <><XCircle className="w-3 h-3 text-red-500" /><span className="text-red-500">Budget Frozen</span></>
                          ) : isLeadQualified ? (
                            <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500">Lead Qualified</span></>
                          ) : item.verification_status === 'Verified' ? (
                            <><Phone className="w-3 h-3" /> Outreach</>
                          ) : (
                            <><FileEdit className="w-3 h-3" /> Verify</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workspace Modal */}
      {showWorkspace && selectedLq && (
        <LqWorkspaceModal
          selectedLq={selectedLq}
          initialTab={selectedLq.verification_status === 'Verified' ? 'outreach' : 'verification'}
          onClose={() => { setShowWorkspace(false); dispatch(fetchLqPipeline()); }}
          hasIncorrect={hasIncorrect}
          allCorrect={allCorrect}
          verificationFields={verificationFields}
          handleFieldToggle={handleFieldToggle}
          handleSubmitIssue={handleSubmitIssue}
          handleReadyForOutreach={handleReadyForOutreach}
        />
      )}
    </div>
  );
};

export default LqPipelinePage;
