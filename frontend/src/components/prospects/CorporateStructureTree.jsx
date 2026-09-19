import React from 'react';
import { Building2, Network, Globe, MapPin, Link as LinkIcon, AlertCircle, Briefcase, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CorporateStructureTree = ({ prospect }) => {
  if (!prospect) return null;

  const parents = prospect.parent_companies_detail || [];
  const children = prospect.child_companies_detail || [];
  
  const branches = children.filter(c => c.company_structure === 'Branch');
  const subsidiaries = children.filter(c => c.company_structure === 'Subsidiary');

  // Renders a company card
  const CompanyCard = ({ company, type, glow = false }) => (
    <div className={`relative p-5 rounded-xl border ${glow ? 'bg-slate-900 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-800'} transition-all`}>
      {glow && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          Selected Prospect Focus
        </div>
      )}
      <div className="text-center">
        <Link to={`/prospects/${company.id}`} className="inline-block hover:opacity-80 transition-opacity">
          <h3 className="text-lg font-bold text-white mb-1">{company.company_name}</h3>
        </Link>
        <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-4">
          <MapPin size={12} /> {company.country_head_office} &bull; {company.primary_industries}
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-3">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Structure</div>
            <div className="text-sm font-medium text-slate-300">{company.company_structure || 'N/A'}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Operational Status</div>
            <div className={`text-sm font-medium ${company.operational_status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {company.operational_status || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MiniCard = ({ company, badgeLabel, badgeColor }) => (
    <div className="block p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-all group relative">
      <Link to={`/prospects/${company.id}`} className="absolute inset-0 z-0"></Link>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor} text-white uppercase tracking-wider`}>
          {badgeLabel}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <MapPin size={10} /> {company.country_head_office}
          </div>
          <button className="text-slate-500 hover:text-red-400 transition-colors" title="Remove Link">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h4 className="text-sm font-bold text-slate-200 group-hover:text-white mb-1 truncate relative z-10 pointer-events-none">{company.company_name}</h4>
      <div className="text-xs text-slate-500 truncate relative z-10 pointer-events-none">{company.primary_industries}</div>
    </div>
  );

  return (
    <div className="bg-[#1a1f2e] rounded-xl overflow-hidden p-8 font-sans">
      
      {/* Top Level: Parents */}
      <div className="flex flex-col items-center">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-900/50 bg-indigo-900/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Building2 size={14} /> Parent / Holding Organizations ({parents.length})
        </div>
        
        {parents.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 relative z-10 w-full max-w-2xl">
            {parents.map(p => (
              <div key={p.id} className="w-full sm:w-64">
                <MiniCard company={p} badgeLabel="Parent" badgeColor="bg-indigo-600" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic border border-slate-700/50 rounded-lg px-6 py-3 border-dashed">
            No Parent Organization Linked (Operates as Independent / Top-Level Entity)
          </div>
        )}

        {/* Vertical Line down to Current Focus */}
        <div className="h-12 w-px bg-indigo-900/50 my-2 relative"></div>

        {/* Middle Level: Current Focus */}
        <div className="relative z-10 w-full max-w-md">
          <CompanyCard company={prospect} type={prospect.company_structure} glow={true} />
        </div>

        {/* Vertical Line down to Children */}
        {children.length > 0 && (
          <div className="h-12 w-px bg-indigo-900/50 my-2"></div>
        )}
      </div>

      {/* Bottom Level: Children */}
      {children.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 relative z-10">
          
          {/* Branches */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-900/50 bg-cyan-900/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Globe size={14} /> Connected Branch Offices ({branches.length})
              </div>
            </div>
            {branches.length > 0 ? (
              <div className="space-y-3">
                {branches.map(b => (
                  <MiniCard key={b.id} company={b} badgeLabel="Branch" badgeColor="bg-cyan-600" />
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-700 rounded-lg">
                No branch offices connected.
              </div>
            )}
          </div>

          {/* Subsidiaries */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-900/50 bg-purple-900/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                <Briefcase size={14} /> Subsidiary & Acquired Entities ({subsidiaries.length})
              </div>
            </div>
            {subsidiaries.length > 0 ? (
              <div className="space-y-3">
                {subsidiaries.map(s => (
                  <MiniCard key={s.id} company={s} badgeLabel="Subsidiary" badgeColor="bg-purple-600" />
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-700 rounded-lg">
                No subsidiaries connected.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CorporateStructureTree;
