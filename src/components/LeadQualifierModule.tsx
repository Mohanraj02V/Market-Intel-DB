import React, { useState } from 'react';
import { 
  Company, 
  Person, 
  QualificationStatus, 
  ViewType, 
  BantCriteria, 
  CallStatus, 
  OutreachLog, 
  FieldVerificationState,
  EmailProgress,
  CommunicationOutcome 
} from '../types';
import { 
  Target, 
  Search, 
  Filter, 
  Check, 
  X, 
  Award, 
  TrendingUp, 
  Shield, 
  ArrowLeft, 
  Building2, 
  User, 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  Plus,
  Phone,
  Mail,
  Globe,
  Linkedin,
  MapPin,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock
} from './Icons';

interface LeadQualifierViewProps {
  companies: Company[];
  people: Person[];
  onUpdateQualification?: (
    companyId: string, 
    status: QualificationStatus, 
    score: number, 
    notes: string, 
    bant: BantCriteria
  ) => void;
  onAddToLqPipeline?: (companyId: string) => void;
  onUpdateLqVerification?: (companyId: string, status: 'Unverified' | 'In Progress' | 'Verified', notes?: string) => void;
  onAddOutreachLog?: (companyId: string, log: OutreachLog) => void;
  onUpdateCompanyOutreachState?: (companyId: string, updates: Partial<Company>) => void;
  onUpdateFieldVerification?: (companyId: string, verification: FieldVerificationState) => void;
  onSubmitVerificationIssue?: (companyId: string, issueCategory: string, details: string) => void;
  onConfirmReverified?: (companyId: string) => void;
  navigateTo: (view: ViewType, companyId?: string | null) => void;
  goBack?: () => void;
}

export function LeadQualifierPipelineView({ 
  companies, 
  people, 
  onUpdateQualification, 
  onAddToLqPipeline,
  onUpdateLqVerification,
  onAddOutreachLog,
  onUpdateCompanyOutreachState,
  onUpdateFieldVerification,
  onSubmitVerificationIssue,
  onConfirmReverified,
  navigateTo, 
  goBack 
}: LeadQualifierViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'verification' | 'outreach'>('verification');

  // Pipeline companies (inLqPipeline === true or not explicitly false)
  const pipelineCompanies = companies.filter(c => c.inLqPipeline !== false);

  const getCompanyVerificationStatus = (c: Company): 'Verified' | 'In Progress' | 'Unverified' => {
    if (c.lqVerificationStatus) return c.lqVerificationStatus;
    if (c.verificationStatus === 'Verified') return 'Verified';
    if (c.verificationStatus === 'Pending Verification') return 'In Progress';
    return 'Unverified';
  };

  const filteredCompanies = pipelineCompanies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.industries.toLowerCase().includes(searchTerm.toLowerCase());
    
    const vStatus = getCompanyVerificationStatus(c);
    let matchesStatus = true;
    if (statusFilter === 'Verified') {
      matchesStatus = vStatus === 'Verified';
    } else if (statusFilter === 'In Progress') {
      matchesStatus = vStatus === 'In Progress';
    } else if (statusFilter === 'Unverified') {
      matchesStatus = vStatus === 'Unverified';
    } else if (statusFilter === 'Issue Sent to PRE') {
      matchesStatus = c.verificationIssue === 'orange';
    }

    return matchesSearch && matchesStatus;
  });

  const getVerificationBadge = (status: 'Unverified' | 'In Progress' | 'Verified') => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Metrics calculation
  const totalMasterRecords = companies.length;
  const pipelineCount = pipelineCompanies.length;
  const preIssuesCount = pipelineCompanies.filter(c => c.verificationIssue === 'orange').length;
  const verifiedCount = pipelineCompanies.filter(c => getCompanyVerificationStatus(c) === 'Verified').length;
  const totalOutreachLogsCount = pipelineCompanies.reduce((acc, c) => acc + (c.outreachLogs?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-extrabold text-[11px] uppercase tracking-wider">
                LQ Module
              </span>
              <span className="text-xs text-slate-400 font-semibold">• PRE Master Data Connected</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Lead Verification & Outreach Workspace</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Verify prospect fields, review key personnel & products/services, and execute call & email outreach after verification.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {goBack && (
              <button
                onClick={goBack}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">LQ Pipeline Prospects</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{pipelineCount} <span className="text-xs font-normal text-slate-400">/ {totalMasterRecords} DB</span></p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active in qualification workflow</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Issues Sent to PRE (🟠 !)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-1">{preIssuesCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Awaiting PRE master data update</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Verified Prospects</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{verifiedCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Ready & unlocked for Outreach</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Outreach Activities</span>
            <Phone className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-800 mt-1">{totalOutreachLogsCount}</p>
          <p className="text-[10px] text-sky-600 mt-0.5">Logged calls & emails</p>
        </div>
      </div>

      {/* Qualification Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              {goBack && (
                <button 
                  onClick={goBack} 
                  title="Go Back"
                  className="px-3 py-2 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by master prospect name, country, industry..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Verification Filter:</span>
              {['All', 'Verified', 'In Progress', 'Unverified', 'Issue Sent to PRE'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prospects List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Master Prospect & PRE Data</th>
                <th className="p-3.5">PRE Task Status</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5">Outreach Logs</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map(c => {
                const companyPeople = people.filter(p => p.companyId === c.id);
                const logCount = c.outreachLogs ? c.outreachLogs.length : 0;
                const vStatus = getCompanyVerificationStatus(c);
                const isVerified = vStatus === 'Verified';

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                    {/* Prospect Info */}
                    <td className="p-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => navigateTo('company_detail', c.id)}
                            className="font-bold text-slate-900 hover:text-emerald-700 text-sm flex items-center gap-1.5 transition text-left cursor-pointer"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-normal">
                              {c.structure}
                            </span>
                          </button>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {c.country} • {c.industries}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {companyPeople.length} Personnel
                            </span>
                            <span>•</span>
                            <span>Email: {c.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PRE Task Status Indicator */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        {c.verificationIssue === 'orange' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">!</span>
                            <span>🟠 Issue Sent to PRE</span>
                          </div>
                        ) : c.verificationIssue === 'grey' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                            <span className="w-4 h-4 rounded-full bg-slate-400 text-white font-black flex items-center justify-center text-[10px]">!</span>
                            <span>⚪ PRE Updated Data</span>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.verificationStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {c.verificationStatus || 'Unverified'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getVerificationBadge(vStatus)}`}>
                        {isVerified ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vStatus}</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Outreach Activity Count */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{logCount} Activity Logs</span>
                      </span>
                    </td>

                    {/* Actions: Verify and Outreach */}
                    <td className="p-3.5 text-right space-y-1">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.verificationIssue === 'grey' && onConfirmReverified && (
                          <button
                            onClick={() => onConfirmReverified(c.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] transition cursor-pointer shadow-xs flex items-center gap-1"
                            title="PRE has updated master data. Re-verify and confirm."
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Confirm</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedCompany(c);
                            setModalInitialTab('verification');
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Verify prospect details & 8-point checklist"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Verify Fields</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCompany(c);
                            setModalInitialTab('outreach');
                          }}
                          className={`px-3 py-1.5 font-bold rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isVerified
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                          title={isVerified ? "Execute outreach calls & emails" : "Outreach locked until verified"}
                        >
                          {isVerified ? (
                            <Phone className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>Outreach</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qualification & Outreach Modal Workspace */}
      {selectedCompany && (
        <LeadQualificationWorkspaceModal
          company={selectedCompany}
          people={people.filter(p => p.companyId === selectedCompany.id)}
          initialTab={modalInitialTab}
          onClose={() => setSelectedCompany(null)}
          onUpdateVerification={onUpdateLqVerification}
          onAddOutreachLog={onAddOutreachLog}
          onUpdateCompanyOutreachState={onUpdateCompanyOutreachState}
          onUpdateFieldVerification={onUpdateFieldVerification}
          onSubmitVerificationIssue={onSubmitVerificationIssue}
          onSave={() => setSelectedCompany(null)}
          goBack={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}

interface LeadQualificationWorkspaceModalProps {
  company: Company;
  people: Person[];
  initialTab?: 'verification' | 'outreach';
  onClose: () => void;
  onSave?: (status: QualificationStatus, score: number, notes: string, bant: BantCriteria) => void;
  onUpdateVerification?: (companyId: string, status: 'Unverified' | 'In Progress' | 'Verified', notes?: string) => void;
  onAddOutreachLog?: (companyId: string, log: OutreachLog) => void;
  onUpdateCompanyOutreachState?: (companyId: string, updates: Partial<Company>) => void;
  onUpdateFieldVerification?: (companyId: string, verification: FieldVerificationState) => void;
  onSubmitVerificationIssue?: (companyId: string, issueCategory: string, details: string) => void;
  goBack: () => void;
}

export function LeadQualificationWorkspaceModal({ 
  company, 
  people,
  initialTab = 'verification',
  onClose, 
  onSave, 
  onUpdateVerification,
  onAddOutreachLog,
  onUpdateCompanyOutreachState,
  onUpdateFieldVerification,
  onSubmitVerificationIssue,
  goBack 
}: LeadQualificationWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'verification' | 'outreach'>(initialTab);
  const [isVerified, setIsVerified] = useState<boolean>(company.lqVerificationStatus === 'Verified' || company.verificationStatus === 'Verified');

  // Step 2 Field Verification State (defaulting each field check)
  const defaultFields: FieldVerificationState = company.fieldVerification || {
    companyName: true,
    country: true,
    address: true,
    website: true,
    linkedin: true,
    officialEmail: true,
    contactNumber: true,
    offerings: true
  };

  const [fieldStates, setFieldStates] = useState<FieldVerificationState>(defaultFields);
  const [reportIssueMode, setReportIssueMode] = useState<boolean>(false);
  const [reportIssueReason, setReportIssueReason] = useState<string>('Incorrect Field Data');
  const [reportIssueDetails, setReportIssueDetails] = useState<string>('');
  const [reportCorrectValue, setReportCorrectValue] = useState<string>('');

  // Step 3 & 4 Outreach State
  const initialEmailProgress = company.emailProgress || 'Not Sent';
  const [emailProgress, setEmailProgress] = useState<EmailProgress>(initialEmailProgress);
  
  // Available email recipients
  const availableEmails = Array.from(new Set([
    company.email,
    ...people.map(p => p.email)
  ].filter(Boolean)));

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    company.emailRecipients && company.emailRecipients.length > 0 
      ? company.emailRecipients 
      : (availableEmails.length > 0 ? [availableEmails[0]] : [])
  );
  const [customRecipientInput, setCustomRecipientInput] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>(
    company.lastEmailSubject || `Company Introduction & Solutions Overview — ${company.name}`
  );
  const [emailBody, setEmailBody] = useState<string>(
    `Dear ${company.name} Team,\n\nWe are pleased to introduce our solution portfolio tailored for ${company.industries || 'your industry'}. We would love to schedule a brief introductory discussion to explore potential alignment.\n\nBest regards,\nLead Qualification Team`
  );

  const isEmailSent = ['Sent', 'Waiting for Response', 'Received Response'].includes(emailProgress);
  const [emailCollapsed, setEmailCollapsed] = useState<boolean>(isEmailSent);

  // Call Outcome & Communication Progress State
  const [callStatus, setCallStatus] = useState<CallStatus>(company.lastCallStatus || 'Connected');
  const [ivrExtension, setIvrExtension] = useState<string>(company.ivrExtension || '');
  const [communicationOutcome, setCommunicationOutcome] = useState<CommunicationOutcome | ''>(company.communicationOutcome || '');
  
  // Detail inputs for Call Outcome
  const [requestedEmailConfirm, setRequestedEmailConfirm] = useState<string>(company.email || (people[0]?.email || ''));
  const [callBackTime, setCallBackTime] = useState<string>(company.callBackTime || '');
  const [transferredPersonName, setTransferredPersonName] = useState<string>(company.transferredPersonName || '');
  const [transferredDesignation, setTransferredDesignation] = useState<string>(company.transferredDesignation || '');
  const [sharedContactName, setSharedContactName] = useState<string>(company.sharedContactName || '');
  const [sharedContactDesignation, setSharedContactDesignation] = useState<string>(company.sharedContactDesignation || '');
  const [sharedContactPhone, setSharedContactPhone] = useState<string>(company.sharedContactPhone || '');
  const [sharedContactEmail, setSharedContactEmail] = useState<string>(company.sharedContactEmail || '');
  const [notInterestedReason, setNotInterestedReason] = useState<string>(company.notInterestedReason || '');
  const [callTranscriptNotes, setCallTranscriptNotes] = useState<string>('');

  const allFieldsYes = Object.values(fieldStates).every(val => val === true);

  const toggleField = (key: keyof FieldVerificationState, val: boolean) => {
    setFieldStates(prev => ({ ...prev, [key]: val }));
  };

  const toggleRecipient = (email: string) => {
    setSelectedRecipients(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleAddCustomRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRecipientInput.trim() && !selectedRecipients.includes(customRecipientInput.trim())) {
      setSelectedRecipients(prev => [...prev, customRecipientInput.trim()]);
      setCustomRecipientInput('');
    }
  };

  const handleMarkVerified = () => {
    if (onUpdateFieldVerification) {
      onUpdateFieldVerification(company.id, fieldStates);
    }
    if (onUpdateVerification) {
      onUpdateVerification(company.id, 'Verified', 'Verified all 8 prospect fields.');
    }
    setIsVerified(true);
    setActiveTab('outreach');
  };

  const handleSubmitIssueToPre = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitVerificationIssue) {
      const fieldList = Object.entries(fieldStates)
        .filter(([, v]) => !v)
        .map(([k]) => k)
        .join(', ');
      
      const fullDetails = `Fields with issues: ${fieldList}. ${reportIssueDetails} ${reportCorrectValue ? `(Suggested Correction: ${reportCorrectValue})` : ''}`;
      onSubmitVerificationIssue(company.id, reportIssueReason, fullDetails);
    }
    setReportIssueMode(false);
  };

  const handleSendIntroEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipients.length === 0) return;

    const newProgress: EmailProgress = 'Sent';
    setEmailProgress(newProgress);
    setEmailCollapsed(true);

    const logNotes = `Intro Email sent to [${selectedRecipients.join(', ')}]. Subject: "${emailSubject}"`;
    const newLog: OutreachLog = {
      id: `log_${Date.now()}`,
      type: 'Email',
      notes: logNotes,
      timestamp: new Date().toLocaleString(),
      actor: 'LQ Executive',
      subject: emailSubject,
      emailProgress: newProgress
    };

    if (onAddOutreachLog) onAddOutreachLog(company.id, newLog);
    if (onUpdateCompanyOutreachState) {
      onUpdateCompanyOutreachState(company.id, {
        emailProgress: newProgress,
        emailRecipients: selectedRecipients,
        lastEmailSubject: emailSubject
      });
    }
  };

  const handleUpdateEmailProgressStatus = (status: EmailProgress) => {
    setEmailProgress(status);
    const isSentNow = ['Sent', 'Waiting for Response', 'Received Response'].includes(status);
    if (isSentNow) {
      setEmailCollapsed(true);
    }

    const logNotes = `Email Progress updated to: ${status}`;
    const newLog: OutreachLog = {
      id: `log_${Date.now()}`,
      type: 'Email',
      notes: logNotes,
      timestamp: new Date().toLocaleString(),
      actor: 'LQ Executive',
      emailProgress: status
    };

    if (onAddOutreachLog) onAddOutreachLog(company.id, newLog);
    if (onUpdateCompanyOutreachState) {
      onUpdateCompanyOutreachState(company.id, { emailProgress: status });
    }
  };

  const handleLogCallOutcome = (e: React.FormEvent) => {
    e.preventDefault();

    let detailsParts: string[] = [`Call Status: ${callStatus}`];
    if (ivrExtension.trim()) {
      detailsParts.push(`IVR Ext: ${ivrExtension.trim()}`);
    }

    if (callStatus === 'Connected' && communicationOutcome) {
      if (communicationOutcome === 'Requested Email') {
        detailsParts.push(`Outcome: Requested Email (Confirmed: ${requestedEmailConfirm})`);
      } else if (communicationOutcome === 'Call Back Later') {
        detailsParts.push(`Outcome: Call Back Later (Scheduled: ${callBackTime})`);
      } else if (communicationOutcome === 'Call Transferred') {
        detailsParts.push(`Outcome: Transferred to ${transferredPersonName} (${transferredDesignation})`);
      } else if (communicationOutcome === 'Shared Another Contact') {
        detailsParts.push(`Outcome: Shared Contact ${sharedContactName} - ${sharedContactDesignation} (Ph: ${sharedContactPhone || 'N/A'}, Email: ${sharedContactEmail || 'N/A'})`);
      } else if (communicationOutcome === 'Not Interested') {
        detailsParts.push(`Outcome: Not Interested (Reason: ${notInterestedReason})`);
      }
    }

    if (callTranscriptNotes.trim()) {
      detailsParts.push(`Notes: ${callTranscriptNotes.trim()}`);
    }

    const fullLogNotes = detailsParts.join(' | ');

    const newLog: OutreachLog = {
      id: `log_${Date.now()}`,
      type: 'Call',
      callStatus: callStatus,
      notes: fullLogNotes,
      timestamp: new Date().toLocaleString(),
      actor: 'LQ Executive',
      communicationOutcome: communicationOutcome || undefined,
      ivrExtension: ivrExtension.trim() || undefined
    };

    if (onAddOutreachLog) onAddOutreachLog(company.id, newLog);

    if (onUpdateCompanyOutreachState) {
      onUpdateCompanyOutreachState(company.id, {
        lastCallStatus: callStatus,
        ivrExtension: ivrExtension.trim() || undefined,
        communicationOutcome: communicationOutcome || undefined,
        callBackTime: callBackTime || undefined,
        transferredPersonName: transferredPersonName || undefined,
        transferredDesignation: transferredDesignation || undefined,
        sharedContactName: sharedContactName || undefined,
        sharedContactDesignation: sharedContactDesignation || undefined,
        sharedContactPhone: sharedContactPhone || undefined,
        sharedContactEmail: sharedContactEmail || undefined,
        notInterestedReason: notInterestedReason || undefined
      });
    }

    setCallTranscriptNotes('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              title="Go Back"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Lead Qualification & Outreach Workspace
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {company.structure}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{company.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-white text-slate-900 border-t-2 border-sky-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'verification' ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>Field Verification & Data Details</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'outreach'
                ? 'bg-white text-slate-900 border-t-2 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {isVerified ? (
              <Phone className={`w-4 h-4 ${activeTab === 'outreach' ? 'text-emerald-600' : 'text-slate-400'}`} />
            ) : (
              <Lock className="w-4 h-4 text-amber-500" />
            )}
            <span>Outreach & Call Outcomes</span>
            {!isVerified && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded font-bold border border-amber-300">
                Locked
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: FIELD VERIFICATION & DATA DETAILS */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Prompt Message */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black flex items-center justify-center shrink-0 mt-0.5 text-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sky-950 text-sm">
                    Prospect Field Verification Workspace
                  </h4>
                  <p className="text-xs text-sky-800 mt-0.5">
                    Validate master prospect information, product/service/solution details, and key decision makers below before initiating outreach.
                  </p>
                </div>
              </div>

              {/* 8 Field Verification Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="bg-slate-100 p-3 border-b border-slate-200 font-extrabold text-slate-800 text-xs flex items-center justify-between">
                  <span>8-Point Prospect Information Checklist</span>
                  <span className="text-[11px] text-slate-500 font-normal">Yes = Validated | No = Inaccurate</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Field 1: Company Name */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">1. Company Name</span>
                      <p className="text-slate-600 font-semibold text-xs mt-0.5">{company.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('companyName', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.companyName
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('companyName', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.companyName
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 2: Country */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">2. Country</span>
                      <p className="text-slate-600 font-semibold text-xs mt-0.5">{company.country}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('country', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.country
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('country', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.country
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 3: Address */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">3. Address</span>
                      <p className="text-slate-600 font-semibold text-xs mt-0.5">{company.address || 'No Address Registered'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('address', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.address
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('address', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.address
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 4: Website */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">4. Website</span>
                      <p className="text-indigo-600 font-semibold text-xs mt-0.5">{company.website || 'No Website Registered'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('website', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.website
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('website', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.website
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 5: LinkedIn */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">5. LinkedIn Page</span>
                      <p className="text-blue-600 font-semibold text-xs mt-0.5">{company.linkedin || 'No LinkedIn Registered'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('linkedin', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.linkedin
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('linkedin', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.linkedin
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 6: Official Email */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">6. Official Email</span>
                      <p className="text-slate-600 font-semibold text-xs mt-0.5">{company.email || 'No Official Email Registered'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('officialEmail', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.officialEmail
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('officialEmail', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.officialEmail
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 7: Contact Number */}
                  <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-900">7. Contact Number</span>
                      <p className="text-slate-600 font-semibold text-xs mt-0.5">{company.phone || 'No Phone Registered'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleField('contactNumber', true)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          fieldStates.contactNumber
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleField('contactNumber', false)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          !fieldStates.contactNumber
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Field 8: Products, Services, & Solutions Verification & Full Item Lists */}
                  <div className="p-3.5 space-y-3 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-slate-900">8. Products, Services & Solutions List</span>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">
                          Offering Type: <span className="font-bold text-slate-800">{company.offeringType || 'Multiple'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleField('offerings', true)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                            fieldStates.offerings
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleField('offerings', false)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                            !fieldStates.offerings
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Detailed Offering Lists: Products, Services, Solutions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                      {/* Products List */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <span>📦 Products List</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                            {company.products?.length || 0}
                          </span>
                        </div>
                        {company.products && company.products.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {company.products.map((prod, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
                                {prod}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No products listed</p>
                        )}
                      </div>

                      {/* Services List */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <span>🛠️ Services List</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                            {company.services?.length || 0}
                          </span>
                        </div>
                        {company.services && company.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {company.services.map((serv, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
                                {serv}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No services listed</p>
                        )}
                      </div>

                      {/* Solutions List */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <span>💡 Solutions List</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                            {company.solutions?.length || 0}
                          </span>
                        </div>
                        {company.solutions && company.solutions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {company.solutions.map((sol, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
                                {sol}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No solutions listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Personnel & Decision Maker Details Section */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-0">
                <div className="bg-slate-900 text-white p-3 font-extrabold text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Key Personnel & Decision Makers ({people.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-normal">Direct contact info for Verification & Outreach</span>
                </div>

                {people && people.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {people.map(person => (
                      <div key={person.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{person.name}</span>
                            {person.isDecisionMaker && (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] flex items-center gap-1">
                                ⭐ Key Decision Maker
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 font-bold text-xs">{person.designation}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
                          {person.email && (
                            <a 
                              href={`mailto:${person.email}`}
                              className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>{person.email}</span>
                            </a>
                          )}
                          {person.phone && (
                            <a 
                              href={`tel:${person.phone}`}
                              className="flex items-center gap-1 font-semibold text-emerald-700 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{person.phone}</span>
                            </a>
                          )}
                          {person.linkedin && (
                            <a 
                              href={person.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 font-semibold text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    No key personnel records associated with this company in master data.
                  </div>
                )}
              </div>

              {/* Action Bar for Verification */}
              {allFieldsYes ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Every field is verified as valid (8/8 Yes).
                    </h5>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Click Mark as Verified below to confirm prospect data and unlock Outreach capabilities.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkVerified}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-2 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>✅ Mark as Verified & Unlock Outreach</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Some field(s) marked as inaccurate (No).
                      </h5>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Click Report to submit an issue task to the PRE team.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReportIssueMode(!reportIssueMode)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
                    >
                      {reportIssueMode ? 'Hide Report Form' : '🚩 Report Issue to PRE'}
                    </button>
                  </div>

                  {reportIssueMode && (
                    <form onSubmit={handleSubmitIssueToPre} className="pt-3 border-t border-amber-200/80 space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-amber-950 mb-1">Issue Category Reason</label>
                        <select
                          value={reportIssueReason}
                          onChange={(e) => setReportIssueReason(e.target.value)}
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold"
                        >
                          <option value="Wrong Phone Number">Wrong Phone Number</option>
                          <option value="Wrong Email">Wrong Email</option>
                          <option value="Wrong Website">Wrong Website</option>
                          <option value="Wrong Address">Wrong Address / Country</option>
                          <option value="Wrong LinkedIn">Wrong LinkedIn Page</option>
                          <option value="Incorrect Products/Services">Incorrect Products/Services</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-amber-950 mb-1">Describe the Issue</label>
                        <textarea
                          rows={2}
                          required
                          value={reportIssueDetails}
                          onChange={(e) => setReportIssueDetails(e.target.value)}
                          placeholder="Provide description of what is incorrect..."
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-amber-950 mb-1">Correct Value (Optional)</label>
                        <input
                          type="text"
                          value={reportCorrectValue}
                          onChange={(e) => setReportCorrectValue(e.target.value)}
                          placeholder="e.g. Correct phone: +44 20 7946 0912"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                        >
                          Submit Report to PRE (Triggers 🟠 !)
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OUTREACH & CALL LOGGING WORKSPACE */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              {!isVerified ? (
                /* LOCKED NOTICE IF DATA UNVERIFIED */
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-black shadow-xs">
                    <Lock className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[11px] uppercase tracking-wider border border-amber-200">
                      Verification Required
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-2">
                      🔒 Outreach & Call Outcomes Locked
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                      Outreach features activate only after the prospect’s 8 data fields are fully verified.
                    </p>
                  </div>
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl max-w-md mx-auto text-left text-xs text-sky-900 space-y-1">
                    <span className="font-extrabold flex items-center gap-1 text-sky-950">
                      <Shield className="w-3.5 h-3.5 text-sky-600" /> Next Step to Unlock:
                    </span>
                    <p className="text-[11px] text-sky-800">
                      1. Switch to the <strong>Field Verification & Data Details</strong> tab.<br/>
                      2. Review the 8 prospect fields and click <strong>Mark as Verified</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('verification')}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Go to Field Verification</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* UNLOCKED OUTREACH WORKSPACE */
                <div className="space-y-6">
                  {/* COMPACT TOP EMAIL PROGRESS TRACKER BAR & SECTION */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    {/* Compact Section Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white">Company Introduction Email</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              emailProgress === 'Sent' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                              emailProgress === 'Waiting for Response' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                              emailProgress === 'Received Response' ? 'bg-sky-500/20 text-sky-300 border-sky-400/30' :
                              emailProgress === 'Invalid Email' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                              'bg-slate-700 text-slate-300 border-slate-600'
                            }`}>
                              Status: {emailProgress}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {isEmailSent ? 'Email dispatched to prospect recipients.' : 'Send introductory email to enable call outcomes.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quick Progress Selector Buttons */}
                        <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-[11px]">
                          {(['Invalid Email', 'Sent', 'Waiting for Response', 'Received Response'] as EmailProgress[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateEmailProgressStatus(st)}
                              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                                emailProgress === st 
                                  ? 'bg-indigo-600 text-white shadow-xs' 
                                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        {/* Toggle Collapse/Expand Button */}
                        <button
                          type="button"
                          onClick={() => setEmailCollapsed(!emailCollapsed)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          {emailCollapsed ? (
                            <>
                              <span>Expand Draft</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Collapse</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE DRAFT EMAIL SECTION */}
                    {!emailCollapsed && (
                      <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
                        {/* Recipient Selection */}
                        <div className="space-y-2">
                          <label className="block font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                            Select Introduction Email Recipients
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Company Official Email */}
                            {company.email && (
                              <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                                selectedRecipients.includes(company.email)
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={selectedRecipients.includes(company.email)}
                                  onChange={() => toggleRecipient(company.email)}
                                  className="accent-indigo-600"
                                />
                                <div className="overflow-hidden">
                                  <span className="block truncate text-xs">{company.email}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">Official Company Email</span>
                                </div>
                              </label>
                            )}

                            {/* Key People Emails */}
                            {people.map(p => p.email && (
                              <label key={p.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                                selectedRecipients.includes(p.email)
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={selectedRecipients.includes(p.email)}
                                  onChange={() => toggleRecipient(p.email)}
                                  className="accent-indigo-600"
                                />
                                <div className="overflow-hidden">
                                  <span className="block truncate text-xs font-bold">{p.name} ({p.designation})</span>
                                  <span className="text-[10px] text-slate-500">{p.email}</span>
                                </div>
                              </label>
                            ))}
                          </div>

                          {/* Custom Recipient Addition */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="email"
                              value={customRecipientInput}
                              onChange={(e) => setCustomRecipientInput(e.target.value)}
                              placeholder="Add department or additional email address..."
                              className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomRecipient}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer transition"
                            >
                              Add Recipient
                            </button>
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="block font-extrabold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                            Email Subject
                          </label>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                          />
                        </div>

                        {/* Email Body Draft */}
                        <div>
                          <label className="block font-extrabold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                            Email Message Content
                          </label>
                          <textarea
                            rows={4}
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>

                        {/* Dispatch Action */}
                        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                            <span>Selected Recipients:</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-extrabold">
                              {selectedRecipients.length} Address(es)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleSendIntroEmail}
                            disabled={selectedRecipients.length === 0}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Send Introduction Email & Mark Sent</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CALL OUTCOME SECTION (GATED UNTIL EMAIL IS SENT) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <span>Call Outcome & Communication Progress</span>
                            {!isEmailSent && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] uppercase font-extrabold flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-400" /> Locked
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Record phone call status, IVR extension, and live conversation outcomes.
                          </p>
                        </div>
                      </div>

                      {company.phone && (
                        <a
                          href={`tel:${company.phone}`}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {company.phone}</span>
                        </a>
                      )}
                    </div>

                    {!isEmailSent ? (
                      /* LOCKED OVERLAY UNTIL EMAIL SENT */
                      <div className="p-8 bg-slate-50/80 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-black">
                          <Lock className="w-6 h-6 text-amber-600" />
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-sm">
                          Call Outcome Locked Until Email Marked as Sent
                        </h5>
                        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                          The Lead Qualifier must send the Company Introduction Email first. Once <strong>Sent</strong> is selected above, Call Outcome becomes active automatically.
                        </p>
                        <button
                          type="button"
                          onClick={() => setEmailCollapsed(false)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Open Company Introduction Email</span>
                        </button>
                      </div>
                    ) : (
                      /* ACTIVE CALL WORKSPACE */
                      <form onSubmit={handleLogCallOutcome} className="p-5 space-y-5 text-xs">
                        {/* IVR Extension & Number Confirmation */}
                        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-emerald-700" />
                              Official Company Number: {company.phone || 'No phone registered'}
                            </span>
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              Call the company official number to reach decision makers or reception desk.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">IVR Ext:</label>
                            <input
                              type="text"
                              value={ivrExtension}
                              onChange={(e) => setIvrExtension(e.target.value)}
                              placeholder="e.g. Ext. 104"
                              className="p-2 bg-white border border-emerald-300 rounded-xl text-xs font-extrabold text-slate-900 w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        {/* Call Status Pills */}
                        <div>
                          <label className="block font-extrabold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">
                            1. Record Call Status Outcome
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {(['Connected', 'No Answer', 'Busy', 'Switched Off', 'Invalid Number'] as CallStatus[]).map(st => (
                              <button
                                type="button"
                                key={st}
                                onClick={() => setCallStatus(st)}
                                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                                  callStatus === st
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Communication Progress (When Connected) */}
                        {callStatus === 'Connected' && (
                          <div className="space-y-4 pt-2 border-t border-slate-200">
                            <div>
                              <label className="block font-extrabold text-slate-900 mb-1.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                <span>2. Record Communication Progress Outcome</span>
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {([
                                  'Requested Email',
                                  'Call Back Later',
                                  'Call Transferred',
                                  'Shared Another Contact',
                                  'Not Interested'
                                ] as CommunicationOutcome[]).map(out => (
                                  <button
                                    type="button"
                                    key={out}
                                    onClick={() => setCommunicationOutcome(out)}
                                    className={`p-2.5 rounded-xl border text-left font-extrabold text-xs transition cursor-pointer flex items-center justify-between ${
                                      communicationOutcome === out
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{out}</span>
                                    {communicationOutcome === out && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Dynamic Details form per Communication Progress Step */}
                            {communicationOutcome === 'Requested Email' && (
                              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                                <span className="font-extrabold text-sky-950 block text-xs">
                                  ✉️ Prospect Requested Info Email
                                </span>
                                <label className="block text-[11px] font-bold text-slate-700">Confirm Email Address:</label>
                                <input
                                  type="email"
                                  value={requestedEmailConfirm}
                                  onChange={(e) => setRequestedEmailConfirm(e.target.value)}
                                  placeholder="Confirm prospect email..."
                                  className="w-full p-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold"
                                />
                              </div>
                            )}

                            {communicationOutcome === 'Call Back Later' && (
                              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                                <span className="font-extrabold text-amber-950 block text-xs">
                                  ⏰ Prospect Requested Call Back Later
                                </span>
                                <label className="block text-[11px] font-bold text-slate-700">Preferred Contact Time / Date:</label>
                                <input
                                  type="text"
                                  value={callBackTime}
                                  onChange={(e) => setCallBackTime(e.target.value)}
                                  placeholder="e.g. Tomorrow at 2:30 PM or 2026-08-06 14:00"
                                  className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold"
                                />
                              </div>
                            )}

                            {communicationOutcome === 'Call Transferred' && (
                              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-indigo-950 text-xs">
                                    🔄 Call Transferred to Decision Maker
                                  </span>
                                  <span className="text-[10px] text-indigo-700 font-bold">
                                    Repeat step if transferred again
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Call Connected Person Name:</label>
                                    <input
                                      type="text"
                                      value={transferredPersonName}
                                      onChange={(e) => setTransferredPersonName(e.target.value)}
                                      placeholder="e.g. Michael Ross"
                                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl text-xs font-semibold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Designation:</label>
                                    <input
                                      type="text"
                                      value={transferredDesignation}
                                      onChange={(e) => setTransferredDesignation(e.target.value)}
                                      placeholder="e.g. Vice President of IT"
                                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl text-xs font-semibold"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {communicationOutcome === 'Shared Another Contact' && (
                              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                                <span className="font-extrabold text-purple-950 text-xs block">
                                  👤 Shared Another Contact Information
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Contact Name:</label>
                                    <input
                                      type="text"
                                      value={sharedContactName}
                                      onChange={(e) => setSharedContactName(e.target.value)}
                                      placeholder="e.g. Rachel Zane"
                                      className="w-full p-2 bg-white border border-purple-300 rounded-xl text-xs font-semibold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Designation:</label>
                                    <input
                                      type="text"
                                      value={sharedContactDesignation}
                                      onChange={(e) => setSharedContactDesignation(e.target.value)}
                                      placeholder="e.g. Procurement Lead"
                                      className="w-full p-2 bg-white border border-purple-300 rounded-xl text-xs font-semibold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Phone (Optional):</label>
                                    <input
                                      type="text"
                                      value={sharedContactPhone}
                                      onChange={(e) => setSharedContactPhone(e.target.value)}
                                      placeholder="+1 555-0199"
                                      className="w-full p-2 bg-white border border-purple-300 rounded-xl text-xs font-semibold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Email (Optional):</label>
                                    <input
                                      type="email"
                                      value={sharedContactEmail}
                                      onChange={(e) => setSharedContactEmail(e.target.value)}
                                      placeholder="rachel@company.com"
                                      className="w-full p-2 bg-white border border-purple-300 rounded-xl text-xs font-semibold"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {communicationOutcome === 'Not Interested' && (
                              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                                <span className="font-extrabold text-rose-950 text-xs block">
                                  🚫 Company Not Interested
                                </span>
                                <label className="block text-[11px] font-bold text-slate-700">Reason for Disinterest:</label>
                                <input
                                  type="text"
                                  value={notInterestedReason}
                                  onChange={(e) => setNotInterestedReason(e.target.value)}
                                  placeholder="e.g. Using competitor solution / Budget frozen until next year"
                                  className="w-full p-2 bg-white border border-rose-300 rounded-xl text-xs font-semibold"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Call Transcript / General Notes */}
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Call Transcript & Discussion Summary
                          </label>
                          <textarea
                            rows={3}
                            value={callTranscriptNotes}
                            onChange={(e) => setCallTranscriptNotes(e.target.value)}
                            placeholder="Enter notes from call conversation..."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                          />
                        </div>

                        {/* Log Button */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Record Call Outcome & Save Activity</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Outreach Activity History Log */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Communication History & Outreach Timeline ({company.outreachLogs?.length || 0})</span>
                    </h5>

                    {company.outreachLogs && company.outreachLogs.length > 0 ? (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto">
                        {company.outreachLogs.map(log => (
                          <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  log.type === 'Call' ? 'bg-emerald-100 text-emerald-900' : 'bg-indigo-100 text-indigo-900'
                                }`}>
                                  {log.type}
                                </span>
                                {log.emailProgress && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                                    Email: {log.emailProgress}
                                  </span>
                                )}
                                {log.callStatus && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                    Call: {log.callStatus}
                                  </span>
                                )}
                                {log.ivrExtension && (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                    Ext: {log.ivrExtension}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">{log.timestamp}</span>
                            </div>
                            {log.subject && <p className="font-bold text-slate-900">Subject: {log.subject}</p>}
                            <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">{log.notes}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded-xl">
                        No communication logged yet for {company.name}. Complete the Introduction Email above to begin.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Done / Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
}

interface VerificationIssueModalProps {
  company: Company;
  onClose: () => void;
  onSubmit: (category: string, details: string) => void;
}

export function VerificationIssueModal({ company, onClose, onSubmit }: VerificationIssueModalProps) {
  const issueCategories = [
    'Wrong Company Name',
    'Wrong Phone Number',
    'Wrong Email',
    'Wrong Website',
    'Wrong Contact',
    'Duplicate Company',
    'Company Doesn\'t Exist'
  ];

  const [selectedCategory, setSelectedCategory] = useState(issueCategories[1]);
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedCategory, details);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-amber-500 p-5 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-300 font-black flex items-center justify-center text-sm">
              !
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-black text-amber-950">
                LQ → PRE Verification Issue
              </span>
              <h3 className="text-base font-bold text-slate-950">{company.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-900 hover:bg-amber-600/30 p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-950 font-medium leading-relaxed">
              Submitting a Verification Issue will flag this record with an <strong>Orange (!) Alert</strong> on PRE's task queue. PRE will update the Master Data and notify you when complete.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
              Select Issue Reason
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {issueCategories.map(cat => (
                <label
                  key={cat}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer font-semibold ${
                    selectedCategory === cat
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="issueCategory"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-amber-600"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[11px]">
              Additional Details / Correction Guidance
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Call attempted on 020 7946 0912 returned disconnected tone. Please verify new primary contact phone."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-950" />
              <span>Submit Issue to PRE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
