import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle, Briefcase, Mail, Phone, CheckCircle, PhoneOff, PhoneMissed, PhoneCall, AlertCircle, Users } from 'lucide-react';
import api from '../services/api';

const CALL_STATUS_CONFIG = {
  'Connected':      { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-700', light: 'bg-emerald-50', ring: 'ring-emerald-400', label: 'Connected', icon: CheckCircle },
  'No Answer':      { bg: 'bg-amber-500',   border: 'border-amber-400',   text: 'text-amber-700',   light: 'bg-amber-50',   ring: 'ring-amber-400',   label: 'No Answer', icon: PhoneMissed },
  'Busy':           { bg: 'bg-orange-500',  border: 'border-orange-400',  text: 'text-orange-700',  light: 'bg-orange-50',  ring: 'ring-orange-400',  label: 'Busy', icon: PhoneCall },
  'Switched Off':   { bg: 'bg-rose-500',    border: 'border-rose-400',    text: 'text-rose-700',    light: 'bg-rose-50',    ring: 'ring-rose-400',    label: 'Switched Off', icon: PhoneOff },
  'Invalid Number': { bg: 'bg-slate-500',   border: 'border-slate-400',   text: 'text-slate-600',   light: 'bg-slate-100',  ring: 'ring-slate-400',   label: 'Invalid Number', icon: AlertCircle },
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
];

const KeyPeoplePage = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const endpoint = searchTerm ? `/key-contacts/?search=${searchTerm}` : '/key-contacts/';
      const response = await api.get(endpoint);
      setContacts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch key contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            Key People
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage and view key contacts associated with prospects.</p>
        </div>
        <div className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Call Status Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">Call Status Colors:</span>
        {Object.entries(CALL_STATUS_CONFIG).map(([status, cfg]) => {
          const Icon = cfg.icon;
          return (
            <span key={status} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.light} ${cfg.border} ${cfg.text}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <UserCircle className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <p className="font-extrabold text-slate-700 text-lg">No key people found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contacts.map((contact, index) => {
            const status = contact.latest_call_status;
            const cfg = status ? CALL_STATUS_CONFIG[status] : null;
            const StatusIcon = cfg ? cfg.icon : null;
            const avatarGrad = AVATAR_COLORS[index % AVATAR_COLORS.length];

            return (
              <div
                key={contact.id}
                onClick={() => navigate(`/key-people/${contact.id}`)}
                className={[
                  'relative bg-white rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group overflow-hidden',
                  cfg
                    ? `${cfg.border} ring-2 ring-offset-0 ${cfg.ring}/40`
                    : 'border-slate-200 hover:border-indigo-300'
                ].join(' ')}
              >
                {/* Top color ribbon */}
                <div className={`h-1.5 w-full ${cfg ? cfg.bg : 'bg-gradient-to-r from-indigo-400 to-violet-500'}`} />

                <div className="p-5 space-y-4">
                  {/* Avatar + Name */}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGrad} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md select-none`}>
                      {getInitials(contact.contact_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors text-sm truncate">
                        {contact.contact_name}
                      </div>
                      {contact.designation && (
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{contact.designation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 max-w-full overflow-hidden">
                    <span className="truncate">{contact.prospect_name || 'Unknown Company'}</span>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {contact.official_email && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium min-w-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.official_email}</span>
                      </div>
                    )}
                    {contact.phone_number && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{contact.phone_number}</span>
                      </div>
                    )}
                    {contact.linkedin_profile && (
                      <div className="flex items-center gap-2 text-[11px] text-blue-600 font-medium">
                        <LinkedinIcon className="w-3.5 h-3.5 shrink-0" />
                        <a
                          href={contact.linkedin_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="truncate hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Call Status Badge */}
                  {cfg && StatusIcon ? (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border ${cfg.light} ${cfg.border} ${cfg.text}`}>
                      <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Last Call: {status}</span>
                      {contact.latest_communication_outcome && (
                        <span className="ml-0.5 opacity-60 font-bold">({contact.latest_communication_outcome})</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-400">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      No calls recorded yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KeyPeoplePage;
