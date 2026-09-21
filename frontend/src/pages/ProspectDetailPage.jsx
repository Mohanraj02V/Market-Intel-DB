import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProspectById, clearSelectedProspect } from '../features/prospects/prospectSlice';
import CorporateStructureTree from '../components/prospects/CorporateStructureTree';
import api from '../services/api';
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Network, Package, Users, Calendar } from 'lucide-react';

const ProspectDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProspect, loading, error } = useSelector((state) => state.prospects);
  const { user } = useSelector((state) => state.auth);
  const [verifyingEmail, setVerifyingEmail] = useState(null);

  const handleVerifyEmail = async (email, contactId = null) => {
    try {
      setVerifyingEmail(email);
      await api.post('/email-verifications/verify/', {
        prospect_id: id,
        prospect_contact_id: contactId,
        email_address: email
      });
      dispatch(fetchProspectById(id));
    } catch (err) {
      console.error('Failed to verify email:', err);
      alert('Failed to verify email. Please try again.');
    } finally {
      setVerifyingEmail(null);
    }
  };

  useEffect(() => {
    dispatch(fetchProspectById(id));
    return () => {
      dispatch(clearSelectedProspect());
    };
  }, [dispatch, id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 rounded-full bg-indigo-600 animate-ping"></div>
          Loading prospect details...
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  if (!selectedProspect) {
    return null;
  }

  const p = selectedProspect;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link to="/prospects" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Prospects
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-indigo-600" />
              {p.company_name}
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1"><MapPin size={16} /> {p.country_head_office}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs">
                {p.company_structure}
              </span>
              <span className={`px-2 py-0.5 rounded-full border font-medium text-xs ${
                p.operational_status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                p.operational_status === 'Inactive' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {p.operational_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Building2 size={20} className="text-indigo-500" /> General Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-slate-500">Complete Address</dt>
                <dd className="mt-1 text-sm text-slate-900">{p.complete_address}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Primary Industries</dt>
                <dd className="mt-1 text-sm text-slate-900">{p.primary_industries}</dd>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {p.official_phone_number && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1"><Phone size={14}/> Phone</dt>
                    <dd className="mt-1 text-sm text-slate-900 break-words">{p.official_phone_number}</dd>
                  </div>
                )}
                {p.official_email_address && (
                  <div className="overflow-hidden">
                    <dt className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1"><Mail size={14}/> Email</dt>
                    <dd className="mt-1 flex items-center justify-between">
                      <a href={`mailto:${p.official_email_address}`} className="text-sm text-indigo-600 break-all hover:underline truncate mr-2">{p.official_email_address}</a>
                      {p.company_email_verification_status ? (
                         <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                           p.company_email_verification_status === 'VALID' ? 'bg-emerald-100 text-emerald-700' :
                           p.company_email_verification_status === 'INVALID' ? 'bg-red-100 text-red-700' :
                           'bg-slate-100 text-slate-700'
                         }`}>
                           {p.company_email_verification_status}
                         </span>
                      ) : user?.role === 'PRE' ? (
                        <button
                          type="button"
                          onClick={() => handleVerifyEmail(p.official_email_address, null)}
                          disabled={verifyingEmail === p.official_email_address}
                          className="shrink-0 px-2 py-0.5 bg-white border border-slate-300 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-50 transition disabled:opacity-50"
                        >
                          {verifyingEmail === p.official_email_address ? 'Verifying...' : 'Verify'}
                        </button>
                      ) : (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">Unverified</span>
                      )}
                    </dd>
                  </div>
                )}
                {p.official_website_url && (
                  <div className="sm:col-span-2 lg:col-span-1 overflow-hidden">
                    <dt className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1"><Globe size={14}/> Website</dt>
                    <dd className="mt-1 text-sm text-indigo-600 break-all"><a href={p.official_website_url} target="_blank" rel="noopener noreferrer">{p.official_website_url}</a></dd>
                  </div>
                )}
              </div>
            </div>
          </div>
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Key Contacts
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {p.key_contacts && p.key_contacts.length > 0 ? (
                p.key_contacts.map((contact, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="font-medium text-sm text-slate-900">{contact.contact_name}</div>
                    <div className="text-xs text-slate-500 mb-2">{contact.designation || 'No designation'}</div>
                    {contact.official_email && (
                      <div className="text-xs text-slate-600 flex items-center mt-1">
                        <a href={`mailto:${contact.official_email}`} className="hover:text-indigo-600 truncate">{contact.official_email}</a>
                      </div>
                    )}
                    {contact.phone_number && <div className="text-xs text-slate-600 mt-1">{contact.phone_number}</div>}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic">No contacts added.</div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Network size={20} className="text-indigo-500" /> Corporate Structure
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <dt className="text-xs font-medium text-slate-500 uppercase mb-1">Structure Type</dt>
                <dd className="text-sm font-medium text-slate-900">{p.company_structure}</dd>
              </div>
              
              {p.parent_companies && p.parent_companies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <dt className="text-xs font-medium text-slate-500 uppercase mb-2">Parent Companies</dt>
                  <dd className="space-y-2">
                    {p.parent_companies.map((parentId, i) => (
                      <div key={i} className="text-sm text-indigo-600 font-medium">
                        <Link to={`/prospects/${parentId}`} className="hover:underline flex items-center gap-1">
                          <Building2 size={14} /> View Parent Record
                        </Link>
                      </div>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          </div>
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-indigo-500" /> Market Offerings
                <span className="ml-2 text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-700">{p.primary_offering_type}</span>
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {p.products && p.products.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Products</h4>
                  <ul className="space-y-2">
                    {p.products.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{item.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {p.services && p.services.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Services</h4>
                  <ul className="space-y-2">
                    {p.services.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{item.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {p.solutions && p.solutions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Solutions</h4>
                  <ul className="space-y-2">
                    {p.solutions.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{item.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!(p.products?.length || p.services?.length || p.solutions?.length) && (
                <div className="text-sm text-slate-500 italic">No offerings specified.</div>
              )}
            </div>
          </div>
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-500" /> Market Events
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {p.market_events && p.market_events.length > 0 ? (
                p.market_events.map((event, i) => (
                  <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 transition-colors group">
                    <Link to={`/market-events/${event.id}`} className="block">
                      <div className="font-medium text-sm text-indigo-900 group-hover:text-indigo-700">{event.event_title}</div>
                      <div className="text-xs text-indigo-600/80 mt-1 flex items-center gap-2">
                        <MapPin size={12} /> {event.host_country}
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic">No associated market events.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Branch Visualization Structure */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Network className="h-6 w-6 text-indigo-600" />
          Branch Visualization Structure
        </h2>
        <CorporateStructureTree prospect={p} />
      </div>
    </div>
  );
};

export default ProspectDetailPage;
