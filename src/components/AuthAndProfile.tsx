import React, { useState } from 'react';
import { UserProfile, UserStatus } from '../types';
import { 
  Network, 
  Lock, 
  User, 
  Shield, 
  LogOut, 
  ChevronDown, 
  Check, 
  Clock, 
  AlertTriangle,
  X,
  Mail,
  Building2
} from './Icons';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // PRE Module Credentials
    if (u === 'prospect research executive' && p === 'Admin') {
      const loggedUser: UserProfile = {
        username: 'Prospect Research Executive',
        name: 'Prospect Research Executive',
        email: 'fahad@vortexen.com',
        role: 'Lead Prospect Researcher',
        module: 'PRE',
        department: 'Prospect Research & Intelligence (PRE)',
        status: 'Active',
        lastLogin: new Date().toLocaleString()
      };
      onLoginSuccess(loggedUser);
      return;
    }

    // LQ Module Credentials
    if (u === 'lead qualifier' && p === 'LQ') {
      const loggedUser: UserProfile = {
        username: 'Lead Qualifier',
        name: 'Lead Qualifier Executive',
        email: 'fahad@vortexen.com',
        role: 'Senior Lead Qualification Specialist',
        module: 'LQ',
        department: 'Lead Qualification & Field Verification (LQ)',
        status: 'Active',
        lastLogin: new Date().toLocaleString()
      };
      onLoginSuccess(loggedUser);
      return;
    }

    setError('Invalid username or password. Please select one of the available executive modules below.');
  };

  const autofillPRE = () => {
    setUsername('Prospect Research Executive');
    setPassword('Admin');
    setError(null);
  };

  const autofillLQ = () => {
    setUsername('Lead Qualifier');
    setPassword('LQ');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans text-slate-800 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10">
        {/* Brand Header */}
        <div className="bg-slate-950 p-6 text-white text-center border-b border-slate-800">
          <div className="inline-flex p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl mb-3 text-indigo-400">
            <Network className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">MarketIntel DB</h1>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1">
            Enterprise Prospect & Qualification Platform
          </p>
        </div>

        {/* Module Selection Quick Hints */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-600" /> Executive Access Credentials
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* PRE Card */}
            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 hover:border-indigo-300 transition flex flex-col justify-between space-y-1.5 shadow-2xs">
              <div>
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold rounded text-[9px]">PRE Module</span>
                <p className="font-bold text-slate-800 text-[11px] mt-1 truncate">Prospect Research Exec</p>
                <p className="text-[10px] text-slate-400 font-mono">Pass: Admin</p>
              </div>
              <button
                type="button"
                onClick={autofillPRE}
                className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] transition cursor-pointer"
              >
                Auto-fill PRE
              </button>
            </div>

            {/* LQ Card */}
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 hover:border-emerald-300 transition flex flex-col justify-between space-y-1.5 shadow-2xs">
              <div>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded text-[9px]">LQ Module</span>
                <p className="font-bold text-slate-800 text-[11px] mt-1 truncate">Lead Qualifier</p>
                <p className="text-[10px] text-slate-400 font-mono">Pass: LQ</p>
              </div>
              <button
                type="button"
                onClick={autofillLQ}
                className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition cursor-pointer"
              >
                Auto-fill LQ
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username / Executive ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Prospect Research Executive or Lead Qualifier"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Log In to Selected Workspace</span>
          </button>
        </form>

        <div className="p-4 bg-slate-50 text-center border-t border-slate-200 text-[11px] text-slate-500">
          MarketIntel DB • PRE Master Data & Lead Qualifier (LQ) Platform v2.5
        </div>
      </div>
    </div>
  );
}

interface UserProfileControlProps {
  user: UserProfile;
  onStatusChange: (status: UserStatus) => void;
  onLogout: () => void;
}

export function UserProfileHeaderWidget({ user, onStatusChange, onLogout }: UserProfileControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500 text-emerald-700 border-emerald-200 bg-emerald-50';
      case 'Busy':
        return 'bg-rose-500 text-rose-700 border-rose-200 bg-rose-50';
      case 'Break':
        return 'bg-amber-500 text-amber-700 border-amber-200 bg-amber-50';
      case 'Log out':
        return 'bg-slate-400 text-slate-600 border-slate-200 bg-slate-100';
    }
  };

  const getStatusDotColor = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500';
      case 'Busy':
        return 'bg-rose-500';
      case 'Break':
        return 'bg-amber-500';
      case 'Log out':
        return 'bg-slate-400';
    }
  };

  const handleSelectStatus = (status: UserStatus) => {
    if (status === 'Log out') {
      setIsOpen(false);
      onLogout();
    } else {
      onStatusChange(status);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 transition cursor-pointer"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            PRE
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusDotColor(user.status)}`}
          />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
          <div className="flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${getStatusDotColor(user.status)}`} />
            <span className="text-[10px] font-semibold text-slate-500 capitalize">{user.status}</span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 overflow-hidden font-sans">
            {/* User Info Header */}
            <div className="p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center border border-indigo-400/30">
                  PRE
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{user.name}</h4>
                  <p className="text-xs text-indigo-300 font-medium">{user.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{user.role}</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>Module: <strong className="text-slate-200">PRE</strong></span>
                <button
                  onClick={() => { setIsOpen(false); setShowDetailModal(true); }}
                  className="text-indigo-400 hover:underline cursor-pointer font-semibold"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Status Selection */}
            <div className="p-2 border-b border-slate-100">
              <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Login Status
              </p>
              
              {(['Active', 'Busy', 'Break', 'Log out'] as UserStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleSelectStatus(st)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    user.status === st && st !== 'Log out'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  } ${st === 'Log out' ? 'text-rose-600 hover:bg-rose-50' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(st)}`} />
                    <span>{st}</span>
                  </div>
                  {user.status === st && st !== 'Log out' && (
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  {st === 'Log out' && <LogOut className="w-3.5 h-3.5 text-rose-500" />}
                </button>
              ))}
            </div>

            <div className="p-2 bg-slate-50 text-[10px] text-slate-500 text-center">
              Current Session: Active since {user.lastLogin}
            </div>
          </div>
        </>
      )}

      {/* Full Profile Detail Modal */}
      {showDetailModal && (
        <UserProfileDetailModal
          user={user}
          onClose={() => setShowDetailModal(false)}
          onStatusChange={onStatusChange}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

interface UserProfileDetailModalProps {
  user: UserProfile;
  onClose: () => void;
  onStatusChange: (status: UserStatus) => void;
  onLogout: () => void;
}

export function UserProfileDetailModal({ user, onClose, onStatusChange, onLogout }: UserProfileDetailModalProps) {
  const getStatusDotColor = (status: UserStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Busy': return 'bg-rose-500';
      case 'Break': return 'bg-amber-500';
      case 'Log out': return 'bg-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 border-2 border-indigo-400 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md">
              PRE
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-xs text-indigo-300 font-medium">{user.role}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(user.status)}`} />
                <span className="text-xs font-semibold text-slate-300">Status: {user.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400"/> Email Address:</span>
                <span className="font-bold text-slate-800">{user.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400"/> Module:</span>
                <span className="font-bold text-indigo-700">{user.module}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5"><Shield className="w-4 h-4 text-slate-400"/> Department:</span>
                <span className="font-bold text-slate-800">{user.department}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400"/> Session Started:</span>
                <span className="font-medium text-slate-600">{user.lastLogin}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Change Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Active', 'Busy', 'Break'] as UserStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                      user.status === st
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${getStatusDotColor(st)}`} />
                    <span>{st}</span>
                  </button>
                ))}
                <button
                  onClick={onLogout}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
