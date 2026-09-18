import React, { useState } from 'react';
import { Company, Person, MarketEvent, ViewType } from '../types';
import { getCompanyParents, getCompanyBranches, getCompanySubsidiaries } from '../data/initialData';
import { StatusBadge, VerificationStatusBadge, VerificationIssueIndicator, LqPipelineBadge } from './Badges';
import { CompanyRelationshipsGraph } from './CompanyRelationshipsGraph';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Edit, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Check, 
  GitFork, 
  Network, 
  Calendar,
  ArrowLeft,
  Target,
  Linkedin
} from './Icons';


import { VerificationIssueModal } from './LeadQualifierModule';

export interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  badge?: number | null;
  active: boolean;
  onClick: () => void;
}

export function NavItem({ icon, label, badge, active, onClick }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
        active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge !== null && badge !== undefined && (
        <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
}

export interface DashboardProps {
  companies: Company[];
  people: Person[];
  events: MarketEvent[];
  navigateTo: (view: ViewType, companyId?: string | null) => void;
}

export function DashboardView({ companies, navigateTo }: DashboardProps) {
  const tasks = companies.filter(c => c.verificationIssue === 'orange');
  const verifiedCount = companies.filter(c => c.verificationStatus === 'Verified').length;
  const pendingCount = companies.filter(c => c.verificationStatus === 'Pending Verification').length;
  const commentCount = companies.filter(c => c.verificationStatus === 'Comment Received').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div onClick={() => navigateTo('companies')} className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 cursor-pointer hover:shadow-md transition">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Prospects</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{companies.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-xs border border-emerald-100 bg-emerald-50/20">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600"/> Verified
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{verifiedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500"/> Pending Verification
          </p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-xs border border-amber-200 bg-amber-50/30">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600"/> Comments Received
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{commentCount}</p>
        </div>
      </div>

      {/* Task Queue Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-amber-200 overflow-hidden">
        <div className="p-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-black text-sm">!</div>
            <div>
              <h3 className="font-bold text-amber-950 text-base">My Tasks (Verification Comments Received)</h3>
              <p className="text-xs text-amber-800">
                Prospect records with active verification comments requiring master data updates.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
            {tasks.length} Open {tasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>

        <div className="p-4">
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="p-4 bg-white border border-amber-200 rounded-lg shadow-xs hover:border-amber-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center bg-amber-500 text-slate-950 font-black rounded-full w-5 h-5 text-xs">!</span>
                      <h4 className="font-bold text-slate-900">{task.name}</h4>
                      <span className="text-xs text-slate-500">({task.country})</span>
                    </div>
                    <p className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 font-medium">
                      <strong>Verification Comment:</strong> {task.issueSummary || 'Feedback comment received from verification team.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigateTo('company_detail', task.id)}
                    className="self-start md:self-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Open Prospect</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-medium text-slate-700 text-sm">No Pending Verification Comments</p>
              <p className="text-xs text-slate-500 mt-1">All received verification tasks have been updated.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Prospect Records</h3>
        <div className="space-y-3">
          {companies.slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <VerificationIssueIndicator 
                  issue={c.verificationIssue} 
                  inLqUnverified={c.inLqPipeline && (c.lqVerificationStatus === 'Unverified' || !c.lqVerificationStatus)}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                    {c.inLqPipeline && <LqPipelineBadge company={c} />}
                  </div>
                  <p className="text-xs text-slate-500">{c.industries} • {c.country} • Offering: {c.offeringType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <VerificationStatusBadge status={c.verificationStatus} />
                <button onClick={() => navigateTo('company_detail', c.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface CompaniesViewProps {
  companies: Company[];
  navigateTo: (view: ViewType, companyId?: string | null) => void;
  onAdd: () => void;
  goBack?: () => void;
  userModule?: string;
}

export function CompaniesView({ companies, navigateTo, onAdd, goBack, userModule }: CompaniesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [issueFilter, setIssueFilter] = useState('All');

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.verificationStatus === statusFilter;
    const matchesIssue = issueFilter === 'All' || 
                         (issueFilter === 'orange' && c.verificationIssue === 'orange') ||
                         (issueFilter === 'grey' && c.verificationIssue === 'grey') ||
                         (issueFilter === 'none' && !c.verificationIssue);

    return matchesSearch && matchesStatus && matchesIssue;
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {goBack && (
              <button 
                onClick={goBack} 
                title="Go Back"
                className="px-3 py-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search prospects by name or country..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {userModule !== 'LQ' && (
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shrink-0 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Prospect
            </button>
          )}
        </div>


        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter By:
          </span>
          
          <div className="flex items-center gap-1.5">
            <span>Verification Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Comment Received">Comment Received</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Verified">Verified</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Indicator (!):</span>
            <select 
              value={issueFilter} 
              onChange={(e) => setIssueFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none text-xs font-medium"
            >
              <option value="All">All Indicators</option>
              <option value="orange">Orange ! (Comment Received)</option>
              <option value="grey">Grey ! (Pending Verification)</option>
              <option value="none">No Indicator (Verified)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-4">Prospect Name</th>
              <th className="p-4">Verification Status</th>
              <th className="p-4 text-center">Issue (!)</th>
              <th className="p-4">Location</th>
              <th className="p-4">Structure</th>
              <th className="p-4">Operational Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredCompanies.map(company => (
              <tr key={company.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{company.name}</span>
                    {company.inLqPipeline && (
                      <LqPipelineBadge company={company} />
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{company.website}</div>
                </td>
                <td className="p-4">
                  <VerificationStatusBadge status={company.verificationStatus} />
                </td>
                <td className="p-4 text-center">
                  <VerificationIssueIndicator 
                    issue={company.verificationIssue} 
                    inLqUnverified={company.inLqPipeline && (company.lqVerificationStatus === 'Unverified' || !company.lqVerificationStatus)}
                  />
                </td>
                <td className="p-4 text-slate-600">{company.country}</td>
                <td className="p-4 text-slate-600">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border border-slate-200 bg-slate-50">
                    {company.structure}
                  </span>
                </td>
                <td className="p-4">
                  <StatusBadge status={company.status} />
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => navigateTo('company_detail', company.id)} className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition cursor-pointer">
                    Open Prospect
                  </button>
                </td>
              </tr>
            ))}
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No prospect records match your active filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface CompanyDetailProps {
  companyId: string | null;
  companies: Company[];
  people: Person[];
  events: MarketEvent[];
  navigateTo: (view: ViewType, companyId?: string | null) => void;
  onEdit: (company: Company) => void;
  onAddPerson: () => void;
  onCompleteTask: (companyId: string) => void;
  onSubmitVerificationIssue?: (companyId: string, category: string, details: string) => void;
  onConfirmReverified?: (companyId: string) => void;
  onOpenAddRelationship: (company: Company) => void;
  onRemoveRelationship: (targetId: string, relatedId: string, type: 'Parent' | 'Branch' | 'Subsidiary') => void;
  onAddToLqPipeline?: (companyId: string) => void;
  onRemoveFromLqPipeline?: (companyId: string) => void;
  goBack?: () => void;
  userModule?: string;
}

export function CompanyDetailView({ 
  companyId, 
  companies, 
  people, 
  events, 
  navigateTo, 
  onEdit, 
  onAddPerson,
  onCompleteTask,
  onSubmitVerificationIssue,
  onConfirmReverified,
  onOpenAddRelationship,
  onRemoveRelationship,
  onAddToLqPipeline,
  onRemoveFromLqPipeline,
  goBack,
  userModule
}: CompanyDetailProps) {
  const company = companies.find(c => c.id === companyId);
  const [activeTab, setActiveTab] = useState<'relationships' | 'people' | 'events'>('relationships');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  if (!company) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-slate-500">Prospect record not found.</p>
      {goBack && (
        <button onClick={goBack} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs cursor-pointer">
          Go Back
        </button>
      )}
    </div>
  );

  const parents = getCompanyParents(company, companies);
  const branches = getCompanyBranches(company, companies);
  const subsidiaries = getCompanySubsidiaries(company, companies);
  
  const companyPeople = people.filter(p => p.companyId === company.id);
  const companyEvents = events.filter(e => e.participatingCompanies.includes(company.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {goBack && (
        <div>
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Go Back</span>
          </button>
        </div>
      )}

      {/* BLUE ! INDICATION BANNER FOR LQ PIPELINE PROSPECT */}
      {company.inLqPipeline && (company.lqVerificationStatus === 'Unverified' || !company.lqVerificationStatus) && (
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs ring-2 ring-blue-200">
              !
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-blue-950 text-sm">LQ Lead Qualification Pipeline — Unverified Status (!)</h4>
                <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-[10px] rounded uppercase tracking-wider">Active Blue Indicator</span>
              </div>
              <p className="text-xs text-blue-800 mt-0.5">
                This prospect was moved to the Lead Qualification Pipeline and is currently marked as <strong>Unverified</strong> (Stage 1).
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* VERIFICATION FEEDBACK BANNER */}
      <div className={`p-5 rounded-xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        company.verificationIssue === 'orange' ? 'bg-amber-50 border-amber-300' :
        company.verificationIssue === 'grey' ? 'bg-slate-50 border-slate-300' :
        'bg-emerald-50/60 border-emerald-200'
      }`}>
        <div className="flex items-start gap-3">
          <VerificationIssueIndicator issue={company.verificationIssue} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">PRE Master Data Verification Status</h3>
              <VerificationStatusBadge status={company.verificationStatus} />
            </div>
            {company.verificationIssue === 'orange' && (
              <p className="text-xs text-amber-900 font-medium mt-1">
                <strong>Verification Issue Flagged:</strong> {company.issueSummary || 'LQ flagged inaccurate information. PRE must update master data and complete task.'}
              </p>
            )}
            {company.verificationIssue === 'grey' && (
              <p className="text-xs text-slate-700 font-medium mt-1">
                <strong>PRE Verification Completion:</strong> Requested master data correction completed by PRE. Ready for LQ re-verification signoff.
              </p>
            )}
            {!company.verificationIssue && company.verificationStatus === 'Verified' && (
              <p className="text-xs text-emerald-800 font-medium mt-1">
                Verified. Master Data is accurate, complete, and cleared by LQ.
              </p>
            )}
            {!company.verificationIssue && company.verificationStatus !== 'Verified' && (
              <p className="text-xs text-slate-600 font-medium mt-1">
                Master Data submitted by PRE. Pending Lead Qualifier review or verification issue checks.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {company.verificationIssue === 'orange' && userModule !== 'LQ' && (
            <button 
              onClick={() => onCompleteTask(company.id)} 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Complete PRE Correction Task</span>
            </button>
          )}

          {company.verificationIssue === 'grey' && onConfirmReverified && (
            <button 
              onClick={() => onConfirmReverified(company.id)} 
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Confirm Re-verified (LQ Signoff)</span>
            </button>
          )}

          {!company.verificationIssue && onSubmitVerificationIssue && userModule === 'LQ' && (
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Flag Verification Issue to PRE</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Issue Modal */}
      {isIssueModalOpen && onSubmitVerificationIssue && userModule === 'LQ' && (
        <VerificationIssueModal
          company={company}
          onClose={() => setIsIssueModalOpen(false)}
          onSubmit={(category, details) => {
            onSubmitVerificationIssue(company.id, category, details);
            setIsIssueModalOpen(false);
          }}
        />
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <StatusBadge status={company.status} />
        </div>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-500 shrink-0">
            {company.name.charAt(0)}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {company.name}
              </h1>
              <span className="text-xs font-normal px-2 py-0.5 rounded border border-indigo-100 bg-indigo-50 text-indigo-700">
                {company.structure}
              </span>
              {company.inLqPipeline && (
                <LqPipelineBadge company={company} />
              )}
            </div>

            {/* Primary Offering Type Badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-lg font-bold shadow-2xs">
                <span className="text-indigo-600 uppercase tracking-wider text-[10px]">Primary Offering Type:</span>
                <span className="text-indigo-900 font-extrabold">{company.offeringType}</span>
              </span>
              {company.industries && (
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium">
                  Industry: <strong>{company.industries}</strong>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-1">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400"/> {company.address}, {company.country}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-slate-400"/> {company.phone || 'No Phone Registered'}</span>
              {company.website && <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline"><Globe className="w-4 h-4"/> Website</a>}
              {company.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-slate-400"/> {company.email}</span>}
              {company.linkedin && (
                <a href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                  <Linkedin className="w-4 h-4 text-blue-600"/> LinkedIn Page
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {userModule !== 'LQ' ? (
              <>
                <button onClick={() => onEdit(company)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <Edit className="w-4 h-4" /> Edit Master Details
                </button>
                <button onClick={() => onOpenAddRelationship(company)} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <GitFork className="w-4 h-4" /> Add Relationship Link
                </button>
              </>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>LQ View Mode — Master Data owned & maintained by PRE. If data is incorrect, click <strong>Flag Verification Issue to PRE</strong>.</span>
              </div>
            )}
          </div>

          {/* Lead Qualification Pipeline Controls (Restricted to LQ user module only) */}
          {userModule === 'LQ' && (
            <div className="flex items-center gap-2">
              {!company.inLqPipeline ? (
                onAddToLqPipeline && (
                  <button 
                    onClick={() => onAddToLqPipeline(company.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-emerald-200" />
                    <span>Move to Lead Qualification Pipeline</span>
                  </button>
                )
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LQ Pipeline:</span>
                    {(company.lqVerificationStatus === 'Unverified' || !company.lqVerificationStatus) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-300 rounded-full font-extrabold text-xs shadow-2xs">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black leading-none">!</span>
                        <span>Unverified</span>
                      </span>
                    ) : company.lqVerificationStatus === 'In Progress' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-300 rounded-full font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span>In Progress</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {onRemoveFromLqPipeline && (
                    <button 
                      onClick={() => onRemoveFromLqPipeline(company.id)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold rounded-md text-[11px] transition cursor-pointer"
                      title="Remove from Lead Qualification Pipeline"
                    >
                      Remove from Pipeline
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PROSPECT MASTER DATA & MARKET OFFERINGS PORTFOLIO */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Prospect Master Data & Offerings Portfolio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured by Prospect Research & Executive (PRE) team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Primary Industry:</span>
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-md font-bold text-xs">
              {company.industries || 'Not Specified'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Products List */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Products Offered
              </h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {company.products ? company.products.filter(p => p.trim()).length : 0} items
              </span>
            </div>
            {company.products && company.products.filter(p => p.trim()).length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-700">
                {company.products.filter(p => p.trim()).map((prod, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/60 font-medium text-slate-800 shadow-2xs">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{prod}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic p-2">No specific products registered.</p>
            )}
          </div>

          {/* Services List */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Services Provided
              </h4>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                {company.services ? company.services.filter(s => s.trim()).length : 0} items
              </span>
            </div>
            {company.services && company.services.filter(s => s.trim()).length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-700">
                {company.services.filter(s => s.trim()).map((serv, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/60 font-medium text-slate-800 shadow-2xs">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{serv}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic p-2">No specific services registered.</p>
            )}
          </div>

          {/* Solutions List */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Solutions Provided
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {company.solutions ? company.solutions.filter(sol => sol.trim()).length : 0} items
              </span>
            </div>
            {company.solutions && company.solutions.filter(sol => sol.trim()).length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-700">
                {company.solutions.filter(sol => sol.trim()).map((sol, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/60 font-medium text-slate-800 shadow-2xs">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{sol}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic p-2">No specific solutions registered.</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { id: 'relationships', label: 'Company Relationships', count: parents.length + branches.length + subsidiaries.length },
          { id: 'people', label: 'Key Contacts', count: companyPeople.length },
          { id: 'events', label: 'Market Events', count: companyEvents.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.id === 'relationships' && <GitFork className="w-4 h-4 text-indigo-500" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 min-h-[300px]">
        {activeTab === 'relationships' && (
          <CompanyRelationshipsGraph 
            focusCompany={company}
            allCompanies={companies}
            navigateTo={navigateTo}
            onOpenAddRelationship={onOpenAddRelationship}
            onRemoveRelationship={onRemoveRelationship}
            userModule={userModule}
          />
        )}

        {activeTab === 'people' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Key Contacts</h3>
              <button onClick={onAddPerson} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 cursor-pointer">
                <Plus className="w-4 h-4"/> Add Contact
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyPeople.map(p => (
                <div key={p.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs font-medium text-indigo-600 mb-2">{p.designation}</p>
                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {p.email}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {p.phone || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-3">
            {companyEvents.map(e => (
              <div key={e.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{e.name}</p>
                  <p className="text-xs text-slate-500">{e.country} • {e.date}</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">Exhibitor</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function InfoSection({ title, content }: { title: string; content: string | string[] }) {
  const items = Array.isArray(content) ? content : (content ? [content] : []);
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">None specified</p>
      )}
    </div>
  );
}

export function CompanyCard({ company, onClick, icon, badge }: { key?: string; company: Company; onClick: () => void; icon: React.ReactNode; badge: string }) {
  return (
    <div onClick={onClick} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-xs border border-slate-200">{icon}</div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{company.name}</p>
          <p className="text-xs text-slate-500">{company.country} • {company.industries}</p>
        </div>
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
        {badge}
      </span>
    </div>
  );
}

export interface PeopleViewProps {
  people: Person[];
  companies: Company[];
  navigateTo: (view: ViewType, companyId?: string | null) => void;
  onAdd: () => void;
  goBack?: () => void;
  userModule?: string;
}

export function PeopleView({ people, companies, navigateTo, onAdd, goBack, userModule }: PeopleViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {goBack && (
            <button 
              onClick={goBack} 
              title="Go Back"
              className="px-3 py-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search key personnel by name or designation..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {userModule !== 'LQ' && (
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium cursor-pointer">
            <Plus className="w-4 h-4" /> Add Person
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map(p => {
          const company = companies.find(c => c.id === p.companyId);
          return (
            <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
              <p className="font-bold text-slate-900 text-base">{p.name}</p>
              <p className="text-xs font-semibold text-indigo-600">{p.designation}</p>
              {company && (
                <button 
                  onClick={() => navigateTo('company_detail', company.id)}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{company.name}</span>
                </button>
              )}
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {p.email}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {p.phone || 'N/A'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface EventsViewProps {
  events: MarketEvent[];
  companies: Company[];
  onAdd: () => void;
  onEdit: (event: MarketEvent) => void;
  goBack?: () => void;
  userModule?: string;
}

export function EventsView({ events, companies, onAdd, onEdit, goBack, userModule }: EventsViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {goBack && (
            <button 
              onClick={goBack} 
              title="Go Back"
              className="px-3 py-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <h3 className="font-bold text-slate-800 text-lg">Industry Events & Trade Shows</h3>
        </div>
        {userModule !== 'LQ' && (
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium cursor-pointer">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {events.map(ev => (
          <div key={ev.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-lg">{ev.name}</h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5"/> {ev.country} 
                <span>•</span>
                <Calendar className="w-3.5 h-3.5"/> {ev.date}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-500">Exhibiting Prospects:</span>
                {ev.participatingCompanies.map(cId => {
                  const comp = companies.find(c => c.id === cId);
                  return comp ? (
                    <span key={cId} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                      {comp.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            {userModule !== 'LQ' && (
              <button onClick={() => onEdit(ev)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer">
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface TasksViewProps {
  companies: Company[];
  navigateTo: (view: ViewType, companyId?: string | null) => void;
  onCompleteTask: (companyId: string) => void;
  onConfirmReverified?: (companyId: string) => void;
  goBack?: () => void;
  userModule?: string;
}

export function TasksView({ companies, navigateTo, onCompleteTask, onConfirmReverified, goBack, userModule }: TasksViewProps) {
  const [filter, setFilter] = useState<'all' | 'orange' | 'grey' | 'verified'>('all');

  const orangeTasks = companies.filter(c => c.verificationIssue === 'orange');
  const greyTasks = companies.filter(c => c.verificationIssue === 'grey');
  const verifiedTasks = companies.filter(c => c.verificationStatus === 'Verified' && !c.verificationIssue);

  const displayedCompanies = companies.filter(c => {
    if (filter === 'orange') return c.verificationIssue === 'orange';
    if (filter === 'grey') return c.verificationIssue === 'grey';
    if (filter === 'verified') return c.verificationStatus === 'Verified' && !c.verificationIssue;
    return c.verificationIssue === 'orange' || c.verificationIssue === 'grey'; // 'all' active tasks
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {goBack && (
            <button 
              onClick={goBack}
              className="p-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Verification Tasks & LQ Issues</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                {orangeTasks.length} Action Required
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              All master data verification tasks assigned between PRE and Lead Qualifier (LQ).
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Tasks ({orangeTasks.length + greyTasks.length})
          </button>
          <button
            onClick={() => setFilter('orange')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'orange' ? 'bg-amber-500 text-slate-950 shadow-2xs font-bold' : 'text-slate-700 hover:text-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-950 animate-ping"></span>
            Action Needed ({orangeTasks.length})
          </button>
          <button
            onClick={() => setFilter('grey')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'grey' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Awaiting Signoff ({greyTasks.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'verified' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Verified Cleared ({verifiedTasks.length})
          </button>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-4">
        {displayedCompanies.map(c => (
          <div 
            key={c.id} 
            className={`bg-white rounded-xl shadow-xs border p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              c.verificationIssue === 'orange' ? 'border-amber-300 bg-amber-50/20' :
              c.verificationIssue === 'grey' ? 'border-slate-300 bg-slate-50/40' :
              'border-emerald-200 bg-emerald-50/10'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <VerificationIssueIndicator issue={c.verificationIssue} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                    <span className="text-xs text-slate-500 font-medium">({c.country})</span>
                    <VerificationStatusBadge status={c.verificationStatus} />
                  </div>
                  <p className="text-xs text-slate-500">{c.industries} • Website: {c.website || 'N/A'}</p>
                </div>
              </div>

              {/* Issue detail box */}
              {c.issueSummary && (
                <div className={`p-3 rounded-lg text-xs font-medium border ${
                  c.verificationIssue === 'orange' ? 'bg-amber-100/70 border-amber-300 text-amber-950' :
                  c.verificationIssue === 'grey' ? 'bg-slate-100 border-slate-300 text-slate-800' :
                  'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <strong className="block text-[11px] uppercase tracking-wider mb-0.5 opacity-80">
                    {c.verificationIssue === 'orange' ? 'LQ Flagged Data Issue:' : 'Correction Note:'}
                  </strong>
                  {c.issueSummary}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {c.verificationIssue === 'orange' && userModule !== 'LQ' && (
                <button
                  onClick={() => onCompleteTask(c.id)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete Correction Task</span>
                </button>
              )}

              {c.verificationIssue === 'grey' && onConfirmReverified && userModule === 'LQ' && (
                <button
                  onClick={() => onConfirmReverified(c.id)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Confirm Re-verified (LQ)</span>
                </button>
              )}

              <button
                onClick={() => navigateTo('company_detail', c.id)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Prospect Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {displayedCompanies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
            <h3 className="font-bold text-slate-800 text-base">No Tasks Found for this Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === 'orange' 
                ? 'Great job! There are no active data issues reported by LQ requiring PRE correction.' 
                : 'All verification tasks are clean and up to date.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

