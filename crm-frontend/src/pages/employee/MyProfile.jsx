import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function MyProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Password change
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwError, setPwError] = useState('');

    useEffect(() => {
        api.get('/employee/profile')
            .then(r => {
                setProfile(r.data.data);
                setForm({
                    name: r.data.data.user?.name || '',
                    phone: r.data.data.user?.phone || '',
                    address: r.data.data.address || '',
                    city: r.data.data.city || '',
                    state: r.data.data.state || '',
                    zip_code: r.data.data.zip_code || '',
                    emergency_contact_name: r.data.data.emergency_contact_name || '',
                    emergency_contact_phone: r.data.data.emergency_contact_phone || '',
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.put('/employee/profile', form);
            setSuccess('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to update profile.');
        } finally { setSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwSaving(true);
        setPwError('');
        setPwSuccess('');
        try {
            await api.put('/employee/profile/password', pwForm);
            setPwSuccess('Password changed successfully!');
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            setPwError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to change password.');
        } finally { setPwSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const emp = profile;

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Profile</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and update your personal information.</p>
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Identity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow p-6">
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg">
                        {emp?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{emp?.user?.name}</h2>
                        <p className="text-sm text-gray-500">{emp?.user?.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">{emp?.designation || 'Employee'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">{emp?.department?.name || '—'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-mono">{emp?.employee_code}</span>
                        </div>
                    </div>
                </div>

                {/* Read-only info */}
                {!editing && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            ['Phone', emp?.user?.phone || '—'],
                            ['Department', emp?.department?.name || '—'],
                            ['Designation', emp?.designation || '—'],
                            ['Employment Type', emp?.employment_type?.replace('_', ' ') || '—'],
                            ['Joining Date', emp?.joining_date || '—'],
                            ['Status', emp?.status || '—'],
                            ['Address', emp?.address || '—'],
                            ['City', emp?.city || '—'],
                            ['Emergency Contact', emp?.emergency_contact_name || '—'],
                            ['Emergency Phone', emp?.emergency_contact_phone || '—'],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">{val}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit form */}
                {editing && (
                    <form onSubmit={handleSave} className="space-y-4">
                        {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{error}</div>}
                        {success && <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm px-3 py-2 rounded-lg border border-green-200 dark:border-green-900/30">{success}</div>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Full Name', key: 'name', type: 'text' },
                                { label: 'Phone', key: 'phone', type: 'tel' },
                                { label: 'Address', key: 'address', type: 'text' },
                                { label: 'City', key: 'city', type: 'text' },
                                { label: 'State', key: 'state', type: 'text' },
                                { label: 'Zip Code', key: 'zip_code', type: 'text' },
                                { label: 'Emergency Contact Name', key: 'emergency_contact_name', type: 'text' },
                                { label: 'Emergency Contact Phone', key: 'emergency_contact_phone', type: 'tel' },
                            ].map(({ label, key, type }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                                    <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Password Change */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    {pwError && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{pwError}</div>}
                    {pwSuccess && <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm px-3 py-2 rounded-lg border border-green-200 dark:border-green-900/30">{pwSuccess}</div>}
                    {[
                        { label: 'Current Password', key: 'current_password' },
                        { label: 'New Password', key: 'password' },
                        { label: 'Confirm New Password', key: 'password_confirmation' },
                    ].map(({ label, key }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                            <input required type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    ))}
                    <div className="flex justify-start">
                        <button type="submit" disabled={pwSaving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                            {pwSaving ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
