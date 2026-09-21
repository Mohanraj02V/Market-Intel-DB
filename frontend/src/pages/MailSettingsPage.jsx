import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMailAccounts, saveMailAccount, testSmtp, testImap, clearError, setDefaultAccount } from '../features/outreach/outreachSlice';
import { toast } from 'react-toastify';

const emptyForm = {
    email_address: '',
    display_name: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_security: 'TLS',
    smtp_username: '',
    smtp_app_password: '',
    imap_host: '',
    imap_port: 993,
    imap_security: 'SSL',
    imap_username: '',
    imap_app_password: '',
    default_signature: ''
};

const MailSettingsPage = () => {
    const dispatch = useDispatch();
    const { mailAccounts, status, error } = useSelector(state => state.outreach);
    const { user } = useSelector(state => state.auth);
    const [selectedId, setSelectedId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    
    useEffect(() => {
        dispatch(fetchMailAccounts());
    }, [dispatch]);
    
    const handleSelectAccount = (account) => {
        setFormData({
            ...account,
            smtp_app_password: '',
            imap_app_password: ''
        });
        setSelectedId(account.id);
        setIsEditing(true);
    };

    const handleCreateNew = () => {
        setFormData(emptyForm);
        setSelectedId(null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(emptyForm);
        setSelectedId(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await dispatch(saveMailAccount(formData)).unwrap();
            toast.success("Mail settings saved successfully.");
            setIsEditing(false);
        } catch (err) {
            toast.error(err.error || "Failed to save settings.");
        }
    };
    
    const handleTestSmtp = async (id) => {
        if (!id) return toast.error("Please save the account first.");
        toast.info("Testing SMTP connection...");
        try {
            const res = await dispatch(testSmtp(id)).unwrap();
            toast.success(res.message || "SMTP connection successful.");
            dispatch(fetchMailAccounts());
        } catch (err) {
            toast.error(err.error || "SMTP connection failed.");
        }
    };
    
    const handleTestImap = async (id) => {
        if (!id) return toast.error("Please save the account first.");
        toast.info("Testing IMAP connection...");
        try {
            const res = await dispatch(testImap(id)).unwrap();
            toast.success(res.message || "IMAP connection successful.");
            dispatch(fetchMailAccounts());
        } catch (err) {
            toast.error(err.error || "IMAP connection failed.");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await dispatch(setDefaultAccount(id)).unwrap();
            toast.success("Default account updated.");
            // Update auth user data if necessary or just reload
            window.location.reload();
        } catch (err) {
            toast.error("Failed to set default account.");
        }
    };
    
    if (status === 'loading' && mailAccounts.length === 0) return <div className="p-6">Loading settings...</div>;
    
    return (
        <div className="p-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Sidebar for list of accounts */}
            <div className="md:w-1/3 bg-white p-4 rounded shadow h-fit">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Mail Accounts</h2>
                    <button onClick={handleCreateNew} className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-opacity-90">
                        + New
                    </button>
                </div>
                <div className="space-y-2">
                    {mailAccounts.length === 0 && <p className="text-gray-500 text-sm">No accounts configured.</p>}
                    {mailAccounts.map(acc => {
                        const isDefault = user?.profile?.mail_account?.id === acc.id;
                        return (
                            <div key={acc.id} className={`p-3 border rounded cursor-pointer ${selectedId === acc.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => handleSelectAccount(acc)}>
                                <div className="font-semibold text-sm flex justify-between items-center">
                                    {acc.name || acc.display_name}
                                    {isDefault && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Default</span>}
                                </div>
                                <div className="text-xs text-gray-500">{acc.email_address}</div>
                                <div className="flex gap-2 mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded ${acc.smtp_status === 'VERIFIED' ? 'bg-green-100 text-green-800' : acc.smtp_status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>SMTP: {acc.smtp_status}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded ${acc.imap_status === 'CONNECTED' ? 'bg-green-100 text-green-800' : acc.imap_status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>IMAP: {acc.imap_status}</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    {!isDefault && (
                                        <button onClick={(e) => { e.stopPropagation(); handleSetDefault(acc.id); }} className="text-xs text-blue-600 hover:underline">Set as Default</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Form */}
            <div className="md:w-2/3">
                {!isEditing ? (
                    <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                        Select an account from the left or create a new one.
                    </div>
                ) : (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">{selectedId ? 'Edit Mail Account' : 'New Mail Account'}</h1>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="bg-white p-4 rounded shadow">
                                <h2 className="text-lg font-semibold mb-4">General Details</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium">Internal Profile Name (e.g. Sales Inbox)</label>
                                    <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Email Address</label>
                                        <input required type="email" name="email_address" value={formData.email_address || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Display Name (Visible to recipients)</label>
                                        <input required type="text" name="display_name" value={formData.display_name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded shadow">
                                <h2 className="text-lg font-semibold mb-4">SMTP Settings (Sending)</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">SMTP Host</label>
                                        <input required type="text" name="smtp_host" value={formData.smtp_host || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">SMTP Port</label>
                                        <input required type="number" name="smtp_port" value={formData.smtp_port || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">SMTP Username</label>
                                        <input required type="text" name="smtp_username" value={formData.smtp_username || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">SMTP App Password</label>
                                        <input type="password" name="smtp_app_password" value={formData.smtp_app_password || ''} onChange={handleChange} placeholder={selectedId ? "Leave blank to keep current password" : ""} required={!selectedId} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Security</label>
                                        <select name="smtp_security" value={formData.smtp_security || 'TLS'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2">
                                            <option value="TLS">TLS/STARTTLS</option>
                                            <option value="SSL">SSL/TLS</option>
                                        </select>
                                    </div>
                                </div>
                                {selectedId && (
                                    <div className="mt-4">
                                        <button type="button" onClick={() => handleTestSmtp(selectedId)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                                            Test SMTP Connection
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-4 rounded shadow">
                                <h2 className="text-lg font-semibold mb-4">IMAP Settings (Receiving)</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">IMAP Host</label>
                                        <input required type="text" name="imap_host" value={formData.imap_host || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">IMAP Port</label>
                                        <input required type="number" name="imap_port" value={formData.imap_port || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">IMAP Username</label>
                                        <input required type="text" name="imap_username" value={formData.imap_username || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">IMAP App Password</label>
                                        <input type="password" name="imap_app_password" value={formData.imap_app_password || ''} onChange={handleChange} placeholder={selectedId ? "Leave blank to keep current password" : ""} required={!selectedId} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Security</label>
                                        <select name="imap_security" value={formData.imap_security || 'SSL'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2">
                                            <option value="TLS">TLS/STARTTLS</option>
                                            <option value="SSL">SSL/TLS</option>
                                        </select>
                                    </div>
                                </div>
                                {selectedId && (
                                    <div className="mt-4">
                                        <button type="button" onClick={() => handleTestImap(selectedId)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                                            Test IMAP Connection
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-4 rounded shadow">
                                <h2 className="text-lg font-semibold mb-4">Email Signature</h2>
                                <textarea name="default_signature" value={formData.default_signature || ''} onChange={handleChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="HTML Signature..."></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90">
                                    Save Mail Account
                                </button>
                                <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-700 px-6 py-2 rounded hover:bg-gray-200">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailSettingsPage;
