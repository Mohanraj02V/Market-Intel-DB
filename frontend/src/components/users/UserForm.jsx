import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createUser, updateUser } from '../../features/users/userSlice';
import { X } from 'lucide-react';

const UserForm = ({ isOpen, onClose, userToEdit }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'PRE',
    password: ''
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        email: userToEdit.email || '',
        first_name: userToEdit.first_name || '',
        last_name: userToEdit.last_name || '',
        role: userToEdit.role || 'PRE',
        password: '' // empty password on edit
      });
    } else {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'PRE',
        password: ''
      });
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userToEdit) {
      const data = { ...formData };
      if (!data.password) delete data.password;
      dispatch(updateUser({ id: userToEdit.id, data }));
    } else {
      dispatch(createUser(formData));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/75 backdrop-blur-sm" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">{userToEdit ? 'Edit User' : 'Create New User'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address (Username)</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white">
                <option value="PRE">Prospect Research Engineer (PRE)</option>
                <option value="LQ">Lead Qualifier (LQ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">{userToEdit ? 'Password (leave blank to keep current)' : 'Password'}</label>
              <input type="password" name="password" required={!userToEdit} value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3 pt-4 border-t border-slate-100">
              <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                {userToEdit ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
