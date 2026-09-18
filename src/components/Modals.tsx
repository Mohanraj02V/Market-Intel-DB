import React, { useState } from 'react';
import { Company, Person, MarketEvent, CompanyStructure, OfferingType } from '../types';
import { X, Plus, GitFork } from './Icons';

export interface ModalWrapperProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function ModalWrapper({ title, children, onClose }: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface RelModalProps {
  focusCompany: Company;
  allCompanies: Company[];
  onClose: () => void;
  onSave: (focusCompanyId: string, relatedCompanyId: string, relationshipType: 'Parent' | 'Branch' | 'Subsidiary') => void;
}

export function RelationshipFormModal({ focusCompany, allCompanies, onClose, onSave }: RelModalProps) {
  const [relationshipType, setRelationshipType] = useState<'Parent' | 'Branch' | 'Subsidiary'>('Subsidiary');
  const [relatedCompanyId, setRelatedCompanyId] = useState<string>('');

  const availableCompanies = allCompanies.filter(c => c.id !== focusCompany.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relatedCompanyId) return;
    onSave(focusCompany.id, relatedCompanyId, relationshipType);
  };

  return (
    <ModalWrapper title={`Add Relationship for ${focusCompany.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 space-y-1">
          <strong>Corporate Relationship Linkage:</strong>
          <p>Establish parent, branch, or subsidiary links to build the visualization tree.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Role</label>
          <select 
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value as 'Parent' | 'Branch' | 'Subsidiary')}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Subsidiary">Target company is a Subsidiary of {focusCompany.name}</option>
            <option value="Branch">Target company is a Branch Office of {focusCompany.name}</option>
            <option value="Parent">Selected company is Parent of {focusCompany.name}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Target Company</label>
          <select 
            value={relatedCompanyId}
            onChange={(e) => setRelatedCompanyId(e.target.value)}
            required
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Select target prospect...</option>
            {availableCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.country}) — {c.structure}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg font-semibold shadow-xs cursor-pointer">
            Save Relationship
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export interface MultiParentSelectProps {
  parentIds: string[];
  potentialParents: Company[];
  onChange: (updatedParentIds: string[]) => void;
}

export function MultiParentSelectGroup({ parentIds, potentialParents, onChange }: MultiParentSelectProps) {
  const currentParents = parentIds.length > 0 ? parentIds : [''];

  const handleSelectChange = (index: number, val: string) => {
    const updated = [...currentParents];
    updated[index] = val;
    onChange(updated);
  };

  const handleAddParent = () => {
    onChange([...currentParents, '']);
  };

  const handleRemoveParent = (index: number) => {
    const updated = currentParents.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : ['']);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
          <span>Parent Company (One or More Supported)</span>
          <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleAddParent}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-100 px-2.5 py-1 rounded-md hover:bg-indigo-200 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Parent</span>
        </button>
      </div>

      <div className="space-y-2">
        {currentParents.map((pId, index) => {
          const selectedOtherIds = currentParents.filter((_, i) => i !== index);
          const availableOptions = potentialParents.filter(c => !selectedOtherIds.includes(c.id));

          return (
            <div key={index} className="flex items-center gap-2">
              <select 
                value={pId} 
                onChange={(e) => handleSelectChange(index, e.target.value)}
                required={index === 0}
                className="flex-1 px-3 py-2 bg-white border-2 border-indigo-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-xs"
              >
                <option value="">-- Choose Parent Company {currentParents.length > 1 ? `#${index + 1}` : ''} --</option>
                {availableOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.country}) — {c.structure}</option>
                ))}
              </select>

              {currentParents.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveParent(index)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Remove this Parent Company"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-indigo-700 font-medium">
        Linking parents automatically updates top-level hierarchy trees and joint ownership views.
      </p>
    </div>
  );
}

export interface CompanyFormModalProps {
  company: Company | null;
  allCompanies: Company[];
  allEvents: MarketEvent[];
  allPeople?: Person[];
  onClose: () => void;
  onSave: (companyData: Partial<Company>, selectedEvents?: string[], companyPeople?: Partial<Person>[]) => void;
}

export function CompanyFormModal({ company, allCompanies, allEvents, allPeople = [], onClose, onSave }: CompanyFormModalProps) {
  const [formData, setFormData] = useState<Partial<Company>>(() => {
    if (company) {
      return {
        ...company,
        offeringType: company.offeringType || 'Multiple',
        products: Array.isArray(company.products) && company.products.length > 0 ? company.products : [''],
        services: Array.isArray(company.services) && company.services.length > 0 ? company.services : [''],
        solutions: Array.isArray(company.solutions) && company.solutions.length > 0 ? company.solutions : [''],
        parentId: company.parentId || (company.parentIds && company.parentIds[0]) || '',
        parentIds: Array.isArray(company.parentIds) && company.parentIds.length > 0 
          ? company.parentIds 
          : (company.parentId ? [company.parentId] : [''])
      };
    }
    return {
      name: '', country: '', address: '', phone: '', email: '', website: '', linkedin: '',
      offeringType: 'Multiple',
      products: [''],
      services: [''],
      solutions: [''],
      industries: '',
      structure: 'Parent',
      parentId: '',
      parentIds: [''],
      status: 'Active',
      statusTargetId: ''
    };
  });

  const [peopleList, setPeopleList] = useState<Partial<Person>[]>(() => {
    if (company && company.id) {
      const existing = allPeople.filter(p => p.companyId === company.id);
      if (existing.length > 0) return existing;
    }
    return [{ id: '', name: '', designation: '', email: '', phone: '', linkedin: '' }];
  });

  const [selectedEvents, setSelectedEvents] = useState<string[]>(() => {
    if (!company) return [];
    return allEvents.filter(e => e.participatingCompanies.includes(company.id)).map(e => e.id);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStructureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStructure = e.target.value as CompanyStructure;
    setFormData(prev => ({
      ...prev,
      structure: newStructure,
      parentIds: newStructure === 'Parent' ? [] : (prev.parentIds && prev.parentIds.length > 0 ? prev.parentIds : [''])
    }));
  };

  const handleParentIdsChange = (updatedParentIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      parentIds: updatedParentIds,
      parentId: updatedParentIds[0] || null
    }));
  };

  const handleArrayChange = (field: 'products' | 'services' | 'solutions', index: number, value: string) => {
    const list = formData[field] ? [...formData[field]!] : [];
    list[index] = value;
    setFormData({ ...formData, [field]: list });
  };

  const addArrayItem = (field: 'products' | 'services' | 'solutions') => {
    const list = formData[field] ? [...formData[field]!] : [];
    setFormData({ ...formData, [field]: [...list, ''] });
  };

  const removeArrayItem = (field: 'products' | 'services' | 'solutions', index: number) => {
    const list = formData[field] ? formData[field]!.filter((_, i) => i !== index) : [];
    setFormData({ ...formData, [field]: list.length > 0 ? list : [''] });
  };

  const handlePersonChange = (index: number, field: keyof Person, value: string) => {
    const updated = [...peopleList];
    updated[index] = { ...updated[index], [field]: value };
    setPeopleList(updated);
  };

  const addPerson = () => {
    setPeopleList([...peopleList, { id: '', name: '', designation: '', email: '', phone: '', linkedin: '' }]);
  };

  const removePerson = (index: number) => {
    setPeopleList(peopleList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, selectedEvents, peopleList);
  };

  const showProducts = formData.offeringType === 'Products' || formData.offeringType === 'Multiple';
  const showServices = formData.offeringType === 'Services' || formData.offeringType === 'Multiple';
  const showSolutions = formData.offeringType === 'Solutions' || formData.offeringType === 'Multiple';

  const potentialParents = allCompanies.filter(c => c.id !== company?.id);

  return (
    <ModalWrapper title={company ? "Edit Prospect Master Data" : "Add New Prospect"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Governance & Corporate Structure */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
            <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-600" />
              Corporate Structure & Parent Auto-Linking
            </h4>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              Feeds Relationship Visualizer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Company Structure</label>
              <select 
                name="structure" 
                value={formData.structure} 
                onChange={handleStructureChange} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="Parent">Parent Organization (Ultimate Holding / HQ)</option>
                <option value="Branch">Branch Office (Local Operational Branch)</option>
                <option value="Subsidiary">Subsidiary Company (Owned Subsidiary / Joint Venture)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Operational Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Permanently Closed">Permanently Closed</option>
                <option value="Acquired">Acquired</option>
                <option value="Merged">Merged</option>
              </select>
            </div>
          </div>

          {/* MULTI-PARENT COMPANY SELECTOR FOR BRANCHES OR SUBSIDIARIES */}
          {(formData.structure === 'Branch' || formData.structure === 'Subsidiary') && (
            <div className="pt-2">
              <MultiParentSelectGroup 
                parentIds={formData.parentIds || []}
                potentialParents={potentialParents}
                onChange={handleParentIdsChange}
              />
            </div>
          )}

          {formData.status === 'Acquired' && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
              <label className="block text-xs font-bold text-purple-900 uppercase">Acquiring Target Company</label>
              <select 
                name="statusTargetId" 
                value={formData.statusTargetId || ''} 
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">Select acquiring company...</option>
                {potentialParents.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.country})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* General Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800 text-sm border-b pb-1">General Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Company Name" name="name" value={formData.name || ''} onChange={handleChange} required />
            <FormInput label="Country (Head Office)" name="country" value={formData.country || ''} onChange={handleChange} required />
          </div>
          <FormInput label="Complete Address" name="address" value={formData.address || ''} onChange={handleChange} required />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Official Phone Number" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+1 555-0000" />
            <FormInput label="Official Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="contact@company.example.com" />
            <FormInput label="Official Website URL" name="website" value={formData.website || ''} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="LinkedIn Company Page" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} placeholder="linkedin.com/company/..." />
            <FormInput label="Primary Industries" name="industries" value={formData.industries || ''} onChange={handleChange} placeholder="e.g. Technology, Finance" required />
          </div>
        </div>

        {/* Market Offerings */}
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 text-sm border-b pb-1">Market Offerings</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Offering Type</label>
            <div className="flex flex-wrap gap-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {(['Products', 'Services', 'Solutions', 'Multiple'] as OfferingType[]).map((type) => (
                <label key={type} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="offeringType" 
                    value={type}
                    checked={formData.offeringType === type}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {showProducts && (
              <DynamicInputGroup 
                title="Products Offered" 
                items={formData.products || ['']} 
                field="products" 
                placeholder="e.g. Enterprise Cloud Servers" 
                onChange={handleArrayChange} 
                onAdd={addArrayItem} 
                onRemove={removeArrayItem} 
              />
            )}

            {showServices && (
              <DynamicInputGroup 
                title="Services Provided" 
                items={formData.services || ['']} 
                field="services" 
                placeholder="e.g. IT Strategy & Consulting" 
                onChange={handleArrayChange} 
                onAdd={addArrayItem} 
                onRemove={removeArrayItem} 
              />
            )}

            {showSolutions && (
              <DynamicInputGroup 
                title="Solutions Provided" 
                items={formData.solutions || ['']} 
                field="solutions" 
                placeholder="e.g. Digital Transformation Package" 
                onChange={handleArrayChange} 
                onAdd={addArrayItem} 
                onRemove={removeArrayItem} 
              />
            )}
          </div>
        </div>

        {/* Key Personnel */}
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between border-b pb-1">
            <h4 className="font-semibold text-slate-800 text-sm">Key Contacts / Personnel</h4>
            <span className="text-xs text-slate-500">Assign decision makers for this prospect</span>
          </div>

          <div className="space-y-3">
            {peopleList.map((person, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative group">
                {peopleList.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removePerson(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1 rounded-md cursor-pointer"
                    title="Remove Contact"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormInput 
                    label="Contact Name" 
                    value={person.name || ''} 
                    onChange={(e) => handlePersonChange(idx, 'name', e.target.value)} 
                    placeholder="e.g. Sarah Jenkins" 
                  />
                  <FormInput 
                    label="Designation / Role" 
                    value={person.designation || ''} 
                    onChange={(e) => handlePersonChange(idx, 'designation', e.target.value)} 
                    placeholder="e.g. Chief Executive Officer" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormInput 
                    label="Official Email" 
                    type="email" 
                    value={person.email || ''} 
                    onChange={(e) => handlePersonChange(idx, 'email', e.target.value)} 
                    placeholder="s.jenkins@company.com" 
                  />
                  <FormInput 
                    label="Phone Number" 
                    value={person.phone || ''} 
                    onChange={(e) => handlePersonChange(idx, 'phone', e.target.value)} 
                    placeholder="+1 555-0101" 
                  />
                  <FormInput 
                    label="LinkedIn Profile" 
                    value={person.linkedin || ''} 
                    onChange={(e) => handlePersonChange(idx, 'linkedin', e.target.value)} 
                    placeholder="linkedin.com/in/..." 
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addPerson}
              className="w-full py-2 px-3 border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50/70 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Key Contact
            </button>
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer">
            Save Prospect Record
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export interface DynamicInputProps {
  title: string;
  items: string[];
  field: 'products' | 'services' | 'solutions';
  placeholder: string;
  onChange: (field: 'products' | 'services' | 'solutions', index: number, value: string) => void;
  onAdd: (field: 'products' | 'services' | 'solutions') => void;
  onRemove: (field: 'products' | 'services' | 'solutions', index: number) => void;
}

export function DynamicInputGroup({ title, items, field, placeholder, onChange, onAdd, onRemove }: DynamicInputProps) {
  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{title}</label>
        <span className="text-[10px] text-slate-400">Multiple entries supported</span>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input 
              type="text" 
              value={item} 
              onChange={(e) => onChange(field, index, e.target.value)} 
              placeholder={placeholder}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {items.length > 1 && (
              <button 
                type="button" 
                onClick={() => onRemove(field, index)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        type="button"
        onClick={() => onAdd(field)}
        className="mt-2 w-full py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-md transition-colors duration-150 flex items-center justify-center gap-1 shadow-xs hover:shadow-sm cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Add {title.slice(0, -1)}</span>
      </button>
    </div>
  );
}

export interface InputProps {
  label: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export function FormInput({ label, name, value, onChange, placeholder, type = "text", required = false }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type={type} 
        name={name}
        value={value || ''} 
        onChange={onChange} 
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
    </div>
  );
}

export interface PersonModalProps {
  person: Partial<Person> | null;
  allCompanies: Company[];
  onClose: () => void;
  onSave: (person: Partial<Person>) => void;
}

export function PersonFormModal({ person, allCompanies, onClose, onSave }: PersonModalProps) {
  const [formData, setFormData] = useState<Partial<Person>>(() => ({
    id: person?.id || '',
    companyId: person?.companyId || (allCompanies[0]?.id || ''),
    name: person?.name || '',
    designation: person?.designation || '',
    email: person?.email || '',
    phone: person?.phone || '',
    linkedin: person?.linkedin || ''
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalWrapper title={person?.id ? "Edit Key Contact" : "Add Key Contact"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Associated Company *</label>
          <select 
            name="companyId" 
            value={formData.companyId} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {allCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.country})</option>
            ))}
          </select>
        </div>

        <FormInput label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required />
        <FormInput label="Job Title / Designation" name="designation" value={formData.designation || ''} onChange={handleChange} required />
        <FormInput label="Official Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
        <FormInput label="Phone Number" name="phone" value={formData.phone || ''} onChange={handleChange} />
        <FormInput label="LinkedIn URL" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg font-semibold shadow-xs cursor-pointer">
            Save Contact
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export interface EventModalProps {
  event: MarketEvent | null;
  allCompanies: Company[];
  onClose: () => void;
  onSave: (event: Partial<MarketEvent>) => void;
}

export function EventFormModal({ event, allCompanies, onClose, onSave }: EventModalProps) {
  const [formData, setFormData] = useState<Partial<MarketEvent>>(() => ({
    id: event?.id || '',
    name: event?.name || '',
    country: event?.country || '',
    date: event?.date || '',
    participatingCompanies: event?.participatingCompanies || []
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCompany = (companyId: string) => {
    const list = formData.participatingCompanies || [];
    setFormData({
      ...formData,
      participatingCompanies: list.includes(companyId) 
        ? list.filter(id => id !== companyId) 
        : [...list, companyId]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalWrapper title={event ? "Edit Event" : "Add Market Event"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Event Title" name="name" value={formData.name || ''} onChange={handleChange} required />
        <FormInput label="Host Country" name="country" value={formData.country || ''} onChange={handleChange} required />
        <FormInput label="Event Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">Participating Prospects</label>
          <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            {allCompanies.map(c => (
              <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(formData.participatingCompanies || []).includes(c.id)}
                  onChange={() => toggleCompany(c.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>{c.name} ({c.country})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg font-semibold shadow-xs cursor-pointer">
            Save Event
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
