import React from 'react';
import { CompanyStatus, VerificationStatus } from '../types';
import { CheckCircle2, AlertTriangle, Clock } from './Icons';

export function StatusBadge({ status }: { status: CompanyStatus }) {
  const styles: Record<CompanyStatus, string> = {
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Inactive': 'bg-slate-100 text-slate-800 border-slate-200',
    'Permanently Closed': 'bg-red-100 text-red-800 border-red-200',
    'Merged': 'bg-blue-100 text-blue-800 border-blue-200',
    'Acquired': 'bg-purple-100 text-purple-800 border-purple-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['Inactive']}`}>
      {status}
    </span>
  );
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const styles: Record<VerificationStatus, string> = {
    'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pending Verification': 'bg-slate-100 text-slate-700 border-slate-200',
    'Comment Received': 'bg-amber-50 text-amber-800 border-amber-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      {status === 'Comment Received' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
      {status === 'Pending Verification' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
      {status}
    </span>
  );
}

export function VerificationIssueIndicator({ issue, inLqUnverified }: { issue?: 'orange' | 'grey' | null; inLqUnverified?: boolean }) {
  if (issue === 'orange') {
    return (
      <span title="Action Required: Comment Received from Verification Team" className="inline-flex items-center justify-center bg-amber-500 text-slate-950 font-black rounded-full w-6 h-6 text-xs shadow-xs ring-2 ring-amber-200 animate-pulse">
        !
      </span>
    );
  }
  if (issue === 'grey') {
    return (
      <span title="Corrections Completed: Pending External Verification" className="inline-flex items-center justify-center bg-slate-400 text-white font-black rounded-full w-6 h-6 text-xs shadow-xs">
        !
      </span>
    );
  }
  if (inLqUnverified) {
    return (
      <span title="LQ Qualification Pipeline: Unverified (! in Blue)" className="inline-flex items-center justify-center bg-blue-600 text-white font-black rounded-full w-6 h-6 text-xs shadow-xs ring-2 ring-blue-200">
        !
      </span>
    );
  }
  return <span className="text-slate-300 text-xs font-mono">—</span>;
}

export function LqPipelineBadge({ company }: { company: { inLqPipeline?: boolean; lqVerificationStatus?: string } }) {
  if (!company.inLqPipeline) return null;

  const isUnverified = company.lqVerificationStatus === 'Unverified' || !company.lqVerificationStatus;
  const isInProgress = company.lqVerificationStatus === 'In Progress';

  if (isUnverified) {
    return (
      <span title="LQ Pipeline Stage 1: Unverified (! in Blue)" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-300">
        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black leading-none shadow-2xs">!</span>
        <span>Unverified</span>
      </span>
    );
  }

  if (isInProgress) {
    return (
      <span title="LQ Pipeline Stage 1: In Progress" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300">
        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
        <span>In Progress</span>
      </span>
    );
  }

  return (
    <span title="LQ Pipeline Stage 1: Verified" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span>Verified</span>
    </span>
  );
}
