import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Briefcase, Mail, Phone, ExternalLink, Building2, Calendar } from 'lucide-react';
import api from '../services/api';

const KeyPersonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContactDetail();
  }, [id]);

  const fetchContactDetail = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/key-contacts/${id}/`);
      setContact(response.data);
    } catch (error) {
      console.error('Failed to fetch contact details:', error);
      navigate('/key-people');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-medium text-slate-500">Loading contact details...</div>;
  if (!contact) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button 
        onClick={() => navigate('/key-people')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Key People
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <UserCircle className="w-12 h-12 text-indigo-700" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{contact.contact_name}</h1>
              {contact.designation && (
                <p className="text-slate-500 font-bold text-lg flex items-center gap-2 mt-1">
                  <Briefcase className="w-5 h-5" /> {contact.designation}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                    <Building2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Company</div>
                    <Link to={`/prospects/${contact.prospect}`} className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                      {contact.prospect_name || 'View Company'}
                    </Link>
                  </div>
                </div>
                {contact.official_email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</div>
                      <a href={`mailto:${contact.official_email}`} className="font-bold text-slate-700 hover:text-indigo-600">
                        {contact.official_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {contact.phone_number && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</div>
                      <a href={`tel:${contact.phone_number}`} className="font-bold text-slate-700 hover:text-indigo-600">
                        {contact.phone_number}
                      </a>
                    </div>
                  </div>
                )}
                {contact.linkedin_profile && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">LinkedIn</div>
                      <a href={contact.linkedin_profile} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              Added on {new Date(contact.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyPersonDetailPage;
