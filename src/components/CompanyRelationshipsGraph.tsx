import React from 'react';
import { Company, ViewType } from '../types';
import { getCompanyParents, getCompanyBranches, getCompanySubsidiaries } from '../data/initialData';
import { GitFork, Plus, Building2, ChevronRight, Trash2, Network } from './Icons';

interface GraphProps {
  focusCompany: Company;
  allCompanies: Company[];
  navigateTo: (view: ViewType, companyId: string | null) => void;
  onOpenAddRelationship: (comp: Company) => void;
  onRemoveRelationship: (targetId: string, relatedId: string, type: 'Parent' | 'Branch' | 'Subsidiary') => void;
  userModule?: string;
}

export function CompanyRelationshipsGraph({ focusCompany, allCompanies, navigateTo, onOpenAddRelationship, onRemoveRelationship, userModule }: GraphProps) {
  const parents = getCompanyParents(focusCompany, allCompanies);
  const branches = getCompanyBranches(focusCompany, allCompanies);
  const subsidiaries = getCompanySubsidiaries(focusCompany, allCompanies);
  const isLqUser = userModule === 'LQ';

  return (
    <div className="space-y-4">
      {/* Visualizer Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            Corporate Relationship Visualizer
          </h3>
          <p className="text-xs text-slate-300">
            Visual tree structure for <strong className="text-white font-semibold">{focusCompany.name}</strong> (Parent holdings, branch offices, subsidiaries, and acquired entities)
          </p>
        </div>

        {!isLqUser ? (
          <button 
            onClick={() => onOpenAddRelationship(focusCompany)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Relationship</span>
          </button>
        ) : (
          <span className="px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold shrink-0 self-start sm:self-auto">
            View Only Mode (LQ)
          </span>
        )}
      </div>

      {/* Interactive Visual Structure Canvas */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-8 overflow-auto min-h-[480px] relative transition-all">
        <div className="flex flex-col items-center gap-10 max-w-5xl mx-auto py-2">
          
          {/* PARENT COMPANIES ROW (LEVEL 1) */}
          <div className="w-full flex flex-col items-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Parent / Holding Organizations ({parents.length})</span>
            </div>

            {parents.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {parents.map(parentComp => (
                  <GraphNodeCard 
                    key={parentComp.id}
                    company={parentComp}
                    type="Parent"
                    onNavigate={() => navigateTo('company_detail', parentComp.id)}
                    onRemove={() => onRemoveRelationship(focusCompany.id, parentComp.id, 'Parent')}
                    isLqUser={isLqUser}
                  />
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 border-dashed rounded-lg text-xs text-slate-400 italic">
                No Parent Organization Linked (Operates as Independent / Top-Level Entity)
              </div>
            )}
          </div>

          {/* CONNECTOR PIPES (PARENT TO FOCAL) */}
          <div className="h-6 w-full flex justify-center items-center">
            <div className="w-0.5 h-full bg-gradient-to-b from-indigo-500 to-indigo-600"></div>
          </div>

          {/* FOCAL COMPANY CARD (LEVEL 2 - CENTER) */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-xs opacity-70"></div>
            <div className="relative bg-slate-900 border-2 border-indigo-500 p-6 rounded-xl shadow-2xl min-w-[320px] max-w-md text-white text-center">
              <span className="inline-block px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                Selected Prospect Focus
              </span>
              <h4 className="text-xl font-black text-white">{focusCompany.name}</h4>
              <p className="text-xs text-slate-300 mt-1">{focusCompany.country} • {focusCompany.industries}</p>
              
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Structure</span>
                  <strong className="text-indigo-300 font-semibold">{focusCompany.structure}</strong>
                </div>
                <div className="w-px h-6 bg-slate-800"></div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Operational Status</span>
                  <strong className="text-emerald-400 font-semibold">{focusCompany.status}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CONNECTOR PIPES (FOCAL TO BRANCHES/SUBSIDIARIES) */}
          <div className="h-6 w-full flex justify-center items-center">
            <div className="w-0.5 h-full bg-gradient-to-b from-indigo-600 to-slate-700"></div>
          </div>

          {/* BRANCHES & SUBSIDIARIES ROW (LEVEL 3) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* BRANCHES COLUMN */}
            <div className="flex flex-col items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800/60 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-sky-400" />
                <span>Connected Branch Offices ({branches.length})</span>
              </div>

              {branches.length > 0 ? (
                <div className="flex flex-col gap-3 w-full">
                  {branches.map(branchComp => (
                    <GraphNodeCard 
                      key={branchComp.id}
                      company={branchComp}
                      type="Branch"
                      onNavigate={() => navigateTo('company_detail', branchComp.id)}
                      onRemove={() => onRemoveRelationship(focusCompany.id, branchComp.id, 'Branch')}
                      isLqUser={isLqUser}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 italic text-center">No branch offices linked.</p>
              )}
            </div>

            {/* SUBSIDIARIES COLUMN */}
            <div className="flex flex-col items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Subsidiary & Acquired Entities ({subsidiaries.length})</span>
              </div>

              {subsidiaries.length > 0 ? (
                <div className="flex flex-col gap-3 w-full">
                  {subsidiaries.map(subComp => (
                    <GraphNodeCard 
                      key={subComp.id}
                      company={subComp}
                      type="Subsidiary"
                      onNavigate={() => navigateTo('company_detail', subComp.id)}
                      onRemove={() => onRemoveRelationship(focusCompany.id, subComp.id, 'Subsidiary')}
                      isLqUser={isLqUser}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 italic text-center">No subsidiary or acquired entities linked.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NodeProps {
  key?: string;
  company: Company;
  type: 'Parent' | 'Branch' | 'Subsidiary';
  onNavigate: () => void;
  onRemove: () => void;
  isLqUser?: boolean;
}

export function GraphNodeCard({ company, type, onNavigate, onRemove, isLqUser }: NodeProps) {
  const badgeColors = {
    'Parent': 'bg-indigo-900/80 text-indigo-300 border-indigo-700',
    'Branch': 'bg-sky-900/80 text-sky-300 border-sky-700',
    'Subsidiary': 'bg-purple-900/80 text-purple-300 border-purple-700'
  };

  return (
    <div className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-lg p-3 shadow-md text-left transition duration-150 group relative">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 cursor-pointer" onClick={onNavigate}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColors[type] || 'bg-slate-700 text-slate-300'}`}>
              {type}
            </span>
            <span className="text-[10px] text-slate-400">{company.country}</span>
          </div>
          <h5 className="font-bold text-slate-100 text-sm mt-1 group-hover:text-indigo-300 transition-colors flex items-center gap-1">
            {company.name}
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </h5>
          <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{company.industries}</p>
        </div>

        {!isLqUser && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded transition cursor-pointer"
            title={`Remove ${type} Relationship`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
