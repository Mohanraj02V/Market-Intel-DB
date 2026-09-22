import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarketEvents } from '../../features/marketEvents/marketEventSlice';
import { createProspect, updateProspect } from '../../features/prospects/prospectSlice';
import { X, Plus, Trash2, Building, Network } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ProspectForm = ({ isOpen, onClose, prospect = null, highlightFields = [], onSuccess = null }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyingEmail, setVerifyingEmail] = useState(null);
  const [instantVerificationStatus, setInstantVerificationStatus] = useState(null);
  const [contactVerificationStatuses, setContactVerificationStatuses] = useState({});
  const { user } = useSelector((state) => state.auth);
  const [parentOptions, setParentOptions] = useState([]);
  const [targetOptions, setTargetOptions] = useState([]);
  const { items: marketEventsList } = useSelector((state) => state.marketEvents);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    country_head_office: '',
    complete_address: '',
    official_phone_number: '',
    official_email_address: '',
    official_website_url: '',
    linkedin_company_page: '',
    primary_industries: '',
    company_structure: 'Parent',
    operational_status: 'Active',
    parent_companies: [],
    status_target: '',
    primary_offering_type: 'Multiple',
    products: [],
    services: [],
    solutions: [],
    key_contacts: [],
    market_event_ids: []
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch all prospects for parent/target dropdowns
      api.get('/prospects/?limit=1000').then(res => {
        const options = res.data.results || res.data;
        setParentOptions(options.filter(p => p.id !== prospect?.id && p.company_structure === 'Parent'));
        setTargetOptions(options.filter(p => p.id !== prospect?.id));
      });
    }

    if (prospect && isOpen) {
      dispatch(fetchMarketEvents({}));
      setFormData({
        ...prospect,
        parent_companies: prospect.parent_companies || [],
        status_target: prospect.status_target || '',
        products: prospect.products || [],
        services: prospect.services || [],
        solutions: prospect.solutions || [],
        key_contacts: prospect.key_contacts || [],
        market_event_ids: (prospect.market_events || []).map(e => e.id)
      });
    } else if (isOpen) {
      // Reset form on open if no prospect
      dispatch(fetchMarketEvents({}));
      setFormData({
        company_name: '', country_head_office: '', complete_address: '',
        official_phone_number: '', official_email_address: '', official_website_url: '',
        linkedin_company_page: '', primary_industries: '',
        company_structure: 'Parent', operational_status: 'Active',
        parent_companies: [], status_target: '', primary_offering_type: 'Multiple',
        products: [], services: [], solutions: [], key_contacts: [], market_event_ids: []
      });
      setError(null);
    }
  }, [prospect, isOpen]);

  const handleContactVerifyEmail = async (index, email) => {
    if (!email) return;
    try {
      setVerifyingEmail(`contact-${index}`);
      const res = await api.post('/email-verifications/instant-verify/', {
        email_address: email
      });
      
      setContactVerificationStatuses(prev => ({ ...prev, [index]: res.data.verification_status }));
      
      if (res.data.verification_status === 'VALID') {
        toast.success("Contact email verified successfully!");
      } else {
        toast.warning(`Contact email is ${res.data.verification_status}. Reason: ${res.data.reason}`);
      }
    } catch (err) {
      console.error('Failed to verify contact email:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Unknown error occurred.';
      toast.error(`Failed to verify contact email: ${errorMessage}`);
    } finally {
      setVerifyingEmail(null);
    }
  };

  const handleVerifyEmail = async () => {
    if (!formData.official_email_address) return;
    
    try {
      setVerifyingEmail(formData.official_email_address);
      const res = await api.post('/email-verifications/instant-verify/', {
        email_address: formData.official_email_address
      });
      
      setInstantVerificationStatus(res.data.verification_status);
      
      if (res.data.verification_status === 'VALID') {
        toast.success("Email verified successfully!");
      } else {
        toast.warning(`Email is ${res.data.verification_status}. Reason: ${res.data.reason}`);
      }
    } catch (err) {
      console.error('Failed to verify email:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Unknown error occurred.';
      toast.error(`Failed to verify email: ${errorMessage}`);
    } finally {
      setVerifyingEmail(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'official_email_address') {
      setInstantVerificationStatus(null);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddParent = () => {
    setFormData(prev => ({ ...prev, parent_companies: [...prev.parent_companies, ''] }));
  };

  const handleParentChange = (index, value) => {
    const newParents = [...formData.parent_companies];
    newParents[index] = value;
    setFormData(prev => ({ ...prev, parent_companies: newParents }));
  };

  const handleRemoveParent = (index) => {
    const newParents = formData.parent_companies.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, parent_companies: newParents }));
  };

  const handleAddOffering = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', offering_type: type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1) }]
    }));
  };

  const handleOfferingChange = (type, index, value) => {
    setFormData(prev => {
      const newOfferings = [...prev[type]];
      newOfferings[index] = { ...newOfferings[index], name: value };
      return { ...prev, [type]: newOfferings };
    });
  };

  const handleRemoveOffering = (type, index) => {
    const newOfferings = formData[type].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [type]: newOfferings }));
  };

  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      key_contacts: [...prev.key_contacts, { contact_name: '', designation: '', official_email: '', phone_number: '', linkedin_profile: '' }]
    }));
  };

  const handleContactChange = (index, field, value) => {
    if (field === 'official_email') {
      setContactVerificationStatuses(prev => ({ ...prev, [index]: null }));
    }
    setFormData(prev => {
      const newContacts = [...prev.key_contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, key_contacts: newContacts };
    });
  };

  const handleRemoveContact = (index) => {
    const newContacts = formData.key_contacts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, key_contacts: newContacts }));
    setContactVerificationStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[index];
      // re-index the following ones
      Object.keys(newStatuses).forEach(k => {
        const kInt = parseInt(k);
        if (kInt > index) {
          newStatuses[kInt - 1] = newStatuses[kInt];
          delete newStatuses[kInt];
        }
      });
      return newStatuses;
    });
  };

  const validate = () => {
    if (!formData.company_name) return 'Company Name is required';
    if (!formData.country_head_office) return 'Country is required';
    if (!formData.complete_address) return 'Complete Address is required';
    if (!formData.primary_industries) return 'Primary Industries is required';

    if (['Branch', 'Subsidiary'].includes(formData.company_structure) && formData.parent_companies.length === 0) {
      return `At least one parent company is required for a ${formData.company_structure}`;
    }

    const uniqueParents = new Set(formData.parent_companies.filter(Boolean));
    if (uniqueParents.size !== formData.parent_companies.filter(Boolean).length) {
      return 'Duplicate parent companies are not allowed';
    }

    // Check Key Contacts emails
    for (let i = 0; i < formData.key_contacts.length; i++) {
      const contact = formData.key_contacts[i];
      if (contact.official_email) {
        // If editing an existing contact and email didn't change, bypass verification
        const existingContact = prospect?.key_contacts?.find(c => c.id === contact.id);
        const isUnchanged = existingContact && existingContact.official_email === contact.official_email;
        if (!isUnchanged && contactVerificationStatuses[i] !== 'VALID') {
          return `Please verify the Official Email for Key Contact: ${contact.contact_name || 'Contact ' + (i + 1)} before proceeding.`;
        }
      }
    }

    // Email verification check
    if (formData.official_email_address) {
      // If editing and they haven't touched the email, let it pass.
      const isUnchanged = prospect && prospect.official_email_address === formData.official_email_address;
      if (!isUnchanged && instantVerificationStatus !== 'VALID') {
        return 'Please verify the Official Email Address before proceeding. Only VALID emails are allowed.';
      }
    }

    return null;
  };

  
  const handleMarketEventToggle = (eventId) => {
    setFormData(prev => {
      const currentIds = prev.market_event_ids || [];
      const isSelected = currentIds.includes(eventId);
      return {
        ...prev,
        market_event_ids: isSelected 
          ? currentIds.filter(id => id !== eventId)
          : [...currentIds, eventId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
            const ensureUrl = (url) => {
        if (!url || url.trim() === '') return '';
        if (!/^https?:\/\//i.test(url)) return 'https://' + url;
        return url;
      };

      const cleanData = { ...formData };
      cleanData.official_website_url = ensureUrl(cleanData.official_website_url);
      cleanData.linkedin_company_page = ensureUrl(cleanData.linkedin_company_page);
      cleanData.key_contacts = cleanData.key_contacts.map(c => ({
        ...c,
        linkedin_profile: ensureUrl(c.linkedin_profile)
      }));
      
      // Clean parents
      cleanData.parent_companies = cleanData.parent_companies.filter(Boolean);
      
      // Clean target
      if (!['Acquired', 'Merged'].includes(cleanData.operational_status)) {
        cleanData.status_target = null;
      }
      if (cleanData.status_target === '') cleanData.status_target = null;

      // Clean offerings
      const offerings = [];
      if (['Products', 'Multiple'].includes(cleanData.primary_offering_type)) {
        offerings.push(...cleanData.products.filter(p => p.name.trim() !== ''));
      }
      if (['Services', 'Multiple'].includes(cleanData.primary_offering_type)) {
        offerings.push(...cleanData.services.filter(p => p.name.trim() !== ''));
      }
      if (['Solutions', 'Multiple'].includes(cleanData.primary_offering_type)) {
        offerings.push(...cleanData.solutions.filter(p => p.name.trim() !== ''));
      }
      cleanData.offerings_data = offerings;

      // Clean contacts
      cleanData.key_contacts = cleanData.key_contacts.filter(c => c.contact_name.trim() !== '');

      if (prospect) {
        await dispatch(updateProspect({ id: prospect.id, data: cleanData })).unwrap();
      } else {
        await dispatch(createProspect(cleanData)).unwrap();
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      
      const formatDrfError = (obj, parentKey = '') => {
        let msgs = [];
        for (const [key, value] of Object.entries(obj)) {
          const readableKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const fullKey = parentKey ? `${parentKey} -> ${readableKey}` : readableKey;
          
          if (Array.isArray(value)) {
            msgs.push(`${fullKey}: ${value.join(' ')}`);
          } else if (typeof value === 'object' && value !== null) {
            msgs = msgs.concat(formatDrfError(value, fullKey));
          } else {
            msgs.push(`${fullKey}: ${value}`);
          }
        }
        return msgs;
      };

      if (err && typeof err === 'object' && !err.message) {
        if (err.detail) {
          errorMessage = err.detail;
        } else {
          const errors = formatDrfError(err);
          errorMessage = errors.join(' | ');
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-full bg-white shadow-xl flex flex-col rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {prospect ? 'Edit Prospect Master Data' : 'Add New Prospect'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Corporate Structure */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Network size={20} />
                </div>
                <h3 className="text-lg font-medium text-slate-800">Corporate Structure & Parent Auto-Linking</h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Feeds Relationship Visualizer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">COMPANY STRUCTURE *</label>
                <select name="company_structure" value={formData.company_structure} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-900">
                  <option value="Parent">Parent Organization (Ultimate Holding / HQ)</option>
                  <option value="Branch">Branch Office (Local Operational Branch)</option>
                  <option value="Subsidiary">Subsidiary Company (Owned Subsidiary / JV)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">OPERATIONAL STATUS *</label>
                <select name="operational_status" value={formData.operational_status} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-900">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Permanently Closed">Permanently Closed</option>
                  <option value="Acquired">Acquired</option>
                  <option value="Merged">Merged</option>
                </select>
              </div>
            </div>

            {['Branch', 'Subsidiary'].includes(formData.company_structure) && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-slate-700">PARENT COMPANY (ONE OR MORE SUPPORTED) *</label>
                  <button type="button" onClick={handleAddParent} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                    <Plus size={16} /> Add Parent
                  </button>
                </div>
                {formData.parent_companies.map((parent, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <select value={parent} onChange={(e) => handleParentChange(index, e.target.value)} className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-900">
                      <option value="">Select a parent company...</option>
                      {parentOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.company_name} ({opt.country_head_office})</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleRemoveParent(index)} className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {formData.parent_companies.length === 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">Please add at least one parent company.</div>
                )}
              </div>
            )}

            {['Acquired', 'Merged'].includes(formData.operational_status) && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">TARGET / SURVIVING COMPANY</label>
                <select name="status_target" value={formData.status_target} onChange={handleChange} className="w-full md:w-1/2 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-900">
                  <option value="">Select target company...</option>
                  {targetOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.company_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 2: General Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Building size={20} />
              </div>
              <h3 className="text-lg font-medium text-slate-800">General Information</h3>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('company_name') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country (Head Office) *</label>
                  <input type="text" name="country_head_office" value={formData.country_head_office} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('country_head_office') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Complete Address *</label>
                <textarea name="complete_address" rows="2" value={formData.complete_address} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('complete_address') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Official Phone Number</label>
                  <input type="text" name="official_phone_number" value={formData.official_phone_number} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('official_phone_number') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Official Email Address</label>
                    {(user?.role === 'PRE' || user?.role === 'LQ') && formData.official_email_address && (
                      <div className="flex items-center gap-2">
                        {instantVerificationStatus ? (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            instantVerificationStatus === 'VALID' ? 'bg-emerald-100 text-emerald-700' :
                            instantVerificationStatus === 'INVALID' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {instantVerificationStatus}
                          </span>
                        ) : prospect?.company_email_verification_status && formData.official_email_address === prospect.official_email_address ? (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            prospect.company_email_verification_status === 'VALID' ? 'bg-emerald-100 text-emerald-700' :
                            prospect.company_email_verification_status === 'INVALID' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {prospect.company_email_verification_status}
                          </span>
                        ) : null}
                        
                        {(!instantVerificationStatus || instantVerificationStatus !== 'VALID') && !(prospect?.company_email_verification_status === 'VALID' && formData.official_email_address === prospect.official_email_address) && (
                          <button
                            type="button"
                            onClick={handleVerifyEmail}
                            disabled={verifyingEmail === formData.official_email_address || !formData.official_email_address}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 border border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded"
                          >
                            {verifyingEmail === formData.official_email_address ? 'Verifying...' : 'Check Email'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <input type="email" name="official_email_address" value={formData.official_email_address} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('official_email_address') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Official Website URL</label>
                  <input type="url" name="official_website_url" value={formData.official_website_url} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('official_website_url') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn Company Page</label>
                  <input type="url" name="linkedin_company_page" value={formData.linkedin_company_page} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('linkedin_company_page') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Industries *</label>
                  <input type="text" name="primary_industries" value={formData.primary_industries} onChange={handleChange} className={`w-full rounded-lg  shadow-sm  sm:text-sm py-2 px-3 text-slate-900 ${highlightFields?.includes('primary_industries') ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Market Offerings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Market Offerings</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Primary Offering Type</label>
              <div className="flex flex-wrap gap-4">
                {['Products', 'Services', 'Solutions', 'Multiple'].map(type => (
                  <label key={type} className="inline-flex items-center">
                    <input type="radio" name="primary_offering_type" value={type} checked={formData.primary_offering_type === type} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="ml-2 text-sm text-slate-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6 border-t border-slate-100 pt-6">
              {['Products', 'Multiple'].includes(formData.primary_offering_type) && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">PRODUCTS OFFERED</label>
                    <button type="button" onClick={() => handleAddOffering('products')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                      <Plus size={16} /> Add Products Offer
                    </button>
                  </div>
                  {formData.products.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={item.name} onChange={(e) => handleOfferingChange('products', index, e.target.value)} placeholder="e.g. Enterprise Cloud Servers" className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border text-slate-900" />
                      <button type="button" onClick={() => handleRemoveOffering('products', index)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}

              {['Services', 'Multiple'].includes(formData.primary_offering_type) && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">SERVICES PROVIDED</label>
                    <button type="button" onClick={() => handleAddOffering('services')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                      <Plus size={16} /> Add Services Provide
                    </button>
                  </div>
                  {formData.services.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={item.name} onChange={(e) => handleOfferingChange('services', index, e.target.value)} placeholder="e.g. IT Strategy & Consulting" className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border text-slate-900" />
                      <button type="button" onClick={() => handleRemoveOffering('services', index)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}

              {['Solutions', 'Multiple'].includes(formData.primary_offering_type) && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">SOLUTIONS PROVIDED</label>
                    <button type="button" onClick={() => handleAddOffering('solutions')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                      <Plus size={16} /> Add Solutions Provide
                    </button>
                  </div>
                  {formData.solutions.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={item.name} onChange={(e) => handleOfferingChange('solutions', index, e.target.value)} placeholder="e.g. Digital Transformation Package" className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border text-slate-900" />
                      <button type="button" onClick={() => handleRemoveOffering('solutions', index)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          
          {/* Section 4: Market Events */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold">
                ME
              </div>
              <h3 className="text-lg font-medium text-slate-800">Market Events</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Associate Market Events
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.market_event_ids && formData.market_event_ids.map(id => {
                    const event = marketEventsList?.find(e => e.id === id);
                    if (!event) return null;
                    return (
                      <div key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                        {event.event_title}
                        <button 
                          type="button" 
                          onClick={() => handleMarketEventToggle(id)}
                          className="hover:text-indigo-900 transition-colors ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <select 
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-900"
                  onChange={(e) => {
                    if(e.target.value) handleMarketEventToggle(e.target.value);
                    e.target.value = "";
                  }}
                  value=""
                >
                  <option value="" disabled>+ Select an event to add...</option>
                  {(!marketEventsList || marketEventsList.length === 0) && (
                    <option value="none" disabled>No events created yet</option>
                  )}
                  {marketEventsList && marketEventsList.filter(e => !(formData.market_event_ids || []).includes(e.id)).map(event => (
                    <option key={event.id} value={event.id}>
                      {event.event_title} ({event.host_country})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Key Contacts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800">Key Contacts / Personnel</h3>
                <p className="text-sm text-slate-500 mt-1">Assign decision makers for this prospect</p>
              </div>
              <button type="button" onClick={handleAddContact} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-1">
                <Plus size={16} /> Add Key Contact
              </button>
            </div>

            <div className="space-y-4">
              {formData.key_contacts.map((contact, index) => (
                <div key={index} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 relative">
                  <button type="button" onClick={() => handleRemoveContact(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Contact Name</label>
                      <input type="text" value={contact.contact_name} onChange={(e) => handleContactChange(index, 'contact_name', e.target.value)} className="w-full rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1.5 px-3 border text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Designation / Role</label>
                      <input type="text" value={contact.designation} onChange={(e) => handleContactChange(index, 'designation', e.target.value)} className="w-full rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1.5 px-3 border text-slate-900" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Official Email</label>
                        {(user?.role === 'PRE' || user?.role === 'LQ') && contact.official_email && (
                          <div className="flex items-center gap-2">
                            {contactVerificationStatuses[index] ? (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                contactVerificationStatuses[index] === 'VALID' ? 'bg-emerald-100 text-emerald-700' :
                                contactVerificationStatuses[index] === 'INVALID' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {contactVerificationStatuses[index]}
                              </span>
                            ) : null}
                            
                            {(!contactVerificationStatuses[index] || contactVerificationStatuses[index] !== 'VALID') && !(prospect?.key_contacts?.find(c => c.id === contact.id)?.official_email === contact.official_email) && (
                              <button
                                type="button"
                                onClick={() => handleContactVerifyEmail(index, contact.official_email)}
                                disabled={verifyingEmail === `contact-${index}` || !contact.official_email}
                                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 border border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded"
                              >
                                {verifyingEmail === `contact-${index}` ? 'Verifying...' : 'Check'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <input type="email" value={contact.official_email} onChange={(e) => handleContactChange(index, 'official_email', e.target.value)} className="w-full rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1.5 px-3 border text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
                      <input type="text" value={contact.phone_number} onChange={(e) => handleContactChange(index, 'phone_number', e.target.value)} className={`w-full rounded shadow-sm sm:text-sm py-1.5 px-3 text-slate-900 ${contact.latest_call_status === 'Invalid Number' ? 'border-2 border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500' : 'border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">LinkedIn Profile</label>
                      <input type="url" value={contact.linkedin_profile} onChange={(e) => handleContactChange(index, 'linkedin_profile', e.target.value)} className="w-full rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1.5 px-3 border text-slate-900" />
                    </div>
                  </div>
                </div>
              ))}
              {formData.key_contacts.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-300 rounded-xl">
                  No contacts added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 sticky bottom-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 transition-colors shadow-sm">
            {loading ? 'Saving...' : 'Save Prospect Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProspectForm;



