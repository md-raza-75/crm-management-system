import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';

const emptyForm = { name: '', max_days_per_year: 15, is_paid: true, is_active: true };

export default function LeaveTypeManagement() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/leave-types');
            setTypes(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); };
    const openEdit = (t) => { setEditing(t); setForm({ name: t.name, max_days_per_year: t.max_days_per_year, is_paid: t.is_paid, is_active: t.is_active }); setError(''); setShowModal(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editing) {
                await api.put(`/admin/leave-types/${editing.id}`, form);
            } else {
                await api.post('/admin/leave-types', form);
            }
            setShowModal(false);
            fetch();
        } catch (err) {
            setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to save.');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/leave-types/${id}`);
            setDeleteConfirm(null);
            fetch();
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed to delete.';
            alert(msg);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Leave Types</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure global leave types and annual day quotas.</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Leave Type
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div></div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                {['Leave Type', 'Max Days / Year', 'Paid Leave', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {types.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">No leave types configured.</td></tr>
                            ) : types.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-700 dark:text-teal-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{t.max_days_per_year}</span>
                                        <span className="ml-1 text-xs text-gray-500">days</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.is_paid ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {t.is_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {t.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <button onClick={() => openEdit(t)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Edit</button>
                                        <button onClick={() => setDeleteConfirm(t)} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{error}</div>}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Leave Type Name *</label>
                                <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Days Per Year *</label>
                                <input required type="number" min={0} max={365} value={form.max_days_per_year} onChange={e => setForm(f => ({ ...f, max_days_per_year: parseInt(e.target.value) || 0 }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="is_paid" checked={form.is_paid} onChange={e => setForm(f => ({ ...f, is_paid: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                                    <label htmlFor="is_paid" className="text-sm text-gray-700 dark:text-gray-300">Paid Leave</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="lt_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                                    <label htmlFor="lt_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Leave Type?</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Delete <strong>{deleteConfirm.name}</strong>? Leave types referenced by existing leave requests cannot be deleted — deactivate them instead.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
