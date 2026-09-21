import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertTriangle, RefreshCw, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const FOLDERS = [
  { id: 'INBOX', label: 'Inbox', icon: Mail },
  { id: '"[Gmail]/Sent Mail"', label: 'Sent', icon: Send },
  { id: '"[Gmail]/Spam"', label: 'Spam', icon: AlertTriangle }
];

const InboxPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('INBOX');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [emailBody, setEmailBody] = useState({ html_body: '', text_body: '' });

  const fetchEmails = async (folder) => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/mail-account/fetch_emails/?folder=${folder}&limit=15`);
      setEmails(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch emails.');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const openEmail = async (email) => {
    setSelectedEmail(email);
    setEmailBody({ html_body: '', text_body: '' });
    setBodyLoading(true);
    try {
      const res = await api.get(`/auth/mail-account/fetch_email_body/?folder=${activeFolder}&email_id=${email.id}`);
      setEmailBody(res.data);
    } catch (err) {
      toast.error('Failed to load email body.');
    } finally {
      setBodyLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails(activeFolder);
    setSelectedEmail(null);
    setEmailBody({ html_body: '', text_body: '' });
  }, [activeFolder]);

  const handleRefresh = () => {
    fetchEmails(activeFolder);
    setSelectedEmail(null);
  };

  const renderBody = () => {
    if (bodyLoading) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading email...
        </div>
      );
    }
    if (emailBody.html_body) {
      return (
        <iframe
          srcDoc={emailBody.html_body}
          sandbox="allow-same-origin"
          style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
          title="Email Content"
        />
      );
    }
    if (emailBody.text_body) {
      return (
        <div className="p-6 overflow-y-auto flex-1 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">
          {emailBody.text_body}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
        (Empty Body)
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            Mail Inbox
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">View emails from your configured mail account.</p>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition flex items-center gap-2 border border-slate-200 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">Folders</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {FOLDERS.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition ${activeFolder === f.id ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-w-0 bg-white overflow-hidden">
          {/* Email list */}
          <div className={`flex flex-col border-r border-slate-100 overflow-y-auto transition-all ${selectedEmail ? 'w-72 shrink-0' : 'flex-1'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 gap-2 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading emails...
              </div>
            ) : emails.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No emails found in this folder.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {emails.map(email => (
                  <li
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className={`p-4 cursor-pointer transition ${selectedEmail?.id === email.id ? 'bg-sky-50 border-l-2 border-sky-500' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 truncate flex-1">{email.from?.replace(/<.*>/, '').trim() || email.from}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{email.date?.split(' ').slice(1, 4).join(' ')}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-700 truncate">{email.subject || '(No Subject)'}</h4>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Email body panel */}
          {selectedEmail && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-start gap-3 shrink-0 bg-white">
                <button onClick={() => { setSelectedEmail(null); setEmailBody({ html_body: '', text_body: '' }); }} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-500 mt-0.5 shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">{selectedEmail.subject || '(No Subject)'}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>From: <span className="font-semibold text-slate-700">{selectedEmail.from}</span></span>
                    <span className="text-slate-300">·</span>
                    <span>{selectedEmail.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderBody()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
