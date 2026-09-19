import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../services/api';

const KeyPeoplePage = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
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

  const handleRowClick = (id) => {
    navigate(`/key-people/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-indigo-600" /> Key People
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage and view key contacts associated with prospects.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 rounded-tl-2xl">Contact Details</th>
                <th className="p-4">Company (Prospect)</th>
                <th className="p-4">Contact Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500 font-medium">Loading key people...</td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500 font-medium">No key people found.</td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => handleRowClick(contact.id)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors text-[15px]">
                            {contact.contact_name}
                          </div>
                          {contact.designation && (
                            <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {contact.designation}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {contact.prospect_name || 'Unknown Company'}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="space-y-1.5">
                        {contact.official_email && (
                          <div className="flex items-center gap-2 text-[12px] text-slate-600 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {contact.official_email}
                          </div>
                        )}
                        {contact.phone_number && (
                          <div className="flex items-center gap-2 text-[12px] text-slate-600 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {contact.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeyPeoplePage;
