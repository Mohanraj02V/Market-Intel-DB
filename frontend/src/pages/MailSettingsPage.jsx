import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMailAccount, saveMailAccount, testSmtp, testImap, clearError } from '../features/outreach/outreachSlice';
import { toast } from 'react-toastify';

const MailSettingsPage = () => {
    const dispatch = useDispatch();
    const { mailAccount, status, error } = useSelector(state => state.outreach);
    const [formData, setFormData] = useState({
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
    });
    
    useEffect(() => {
        dispatch(fetchMailAccount());
    }, [dispatch]);
    
    useEffect(() => {
        if (mailAccount) {
            setFormData({
                ...mailAccount,
                smtp_app_password: '',
                imap_app_password: ''
            });
        }
    }, [mailAccount]);
    
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
        } catch (err) {
            toast.error(err.error || "Failed to save settings.");
        }
    };
    
    const handleTestSmtp = async () => {
        toast.info("Testing SMTP connection...");
        try {
            const res = await dispatch(testSmtp()).unwrap();
            toast.success(res.message || "SMTP connection successful.");
        } catch (err) {
            toast.error(err.error || "SMTP connection failed.");
        }
    };
    
    const handleTestImap = async () => {
        toast.info("Testing IMAP connection...");
        try {
            const res = await dispatch(testImap()).unwrap();
            toast.success(res.message || "IMAP connection successful.");
        } catch (err) {
            toast.error(err.error || "IMAP connection failed.");
        }
    };
    
    if (status === 'loading') return <div>Loading settings...</div>;
    
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mail Account Settings</h1>
            
            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">General Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Email Address</label>
                            <input required type="email" name="email_address" value={formData.email_address || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Display Name</label>
                            <input required type="text" name="display_name" value={formData.display_name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">SMTP Settings (Sending)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Host</label>
                            <input required type="text" name="smtp_host" value={formData.smtp_host || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Port</label>
                            <input required type="number" name="smtp_port" value={formData.smtp_port || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Security</label>
                            <select name="smtp_security" value={formData.smtp_security || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2">
                                <option value="TLS">TLS / STARTTLS</option>
                                <option value="SSL">SSL</option>
                                <option value="NONE">None</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Username</label>
                            <input required type="text" name="smtp_username" value={formData.smtp_username || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">App Password</label>
                            <input type="password" name="smtp_app_password" value={formData.smtp_app_password || ''} onChange={handleChange} placeholder={mailAccount ? "Leave blank to keep current password" : ""} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                    </div>
                    {mailAccount && (
                        <button type="button" onClick={handleTestSmtp} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Test SMTP</button>
                    )}
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">IMAP Settings (Receiving)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Host</label>
                            <input required type="text" name="imap_host" value={formData.imap_host || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Port</label>
                            <input required type="number" name="imap_port" value={formData.imap_port || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Security</label>
                            <select name="imap_security" value={formData.imap_security || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2">
                                <option value="TLS">TLS / STARTTLS</option>
                                <option value="SSL">SSL</option>
                                <option value="NONE">None</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Username</label>
                            <input required type="text" name="imap_username" value={formData.imap_username || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">App Password</label>
                            <input type="password" name="imap_app_password" value={formData.imap_app_password || ''} onChange={handleChange} placeholder={mailAccount ? "Leave blank to keep current password" : ""} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                        </div>
                    </div>
                    {mailAccount && (
                        <button type="button" onClick={handleTestImap} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Test IMAP</button>
                    )}
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Signature</h2>
                    <textarea name="default_signature" value={formData.default_signature || ''} onChange={handleChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="Your default email signature..." />
                </div>

                <div className="flex justify-end mt-6">
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold">Save Settings</button>
                </div>
            </form>
        </div>
    );
};

export default MailSettingsPage;
