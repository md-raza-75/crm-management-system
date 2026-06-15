import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';

const emptyForm = { name: '', description: '', head_user_id: '', is_active: true };

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchDepartments();
        api.get('/admin/users', { params: { per_page: 100 } })
            .then(r => setUsers(r.data.data))
            .catch(console.error);
    }, [fetchDepartments]);

    const openCreate = () => {
        setEditingDept(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (d) => {
        setEditingDept(d);
        setForm({ name: d.name, description: d.description || '', head_user_id: d.head_user_id || '', is_active: d.is_active });
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = { ...form, head_user_id: form.head_user_id || null };
            if (editingDept) {
                await api.put(`/admin/departments/${editingDept.id}`, payload);
            } else {
                await api.post('/admin/departments', payload);
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err) {
            const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to save.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/departments/${id}`);
            setDeleteConfirm(null);
            fetchDepartments();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Departments</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage company departments and assign department heads.</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    <div className="col-span-3 flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : departments.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-sm text-gray-500">No departments found. Create your first one.</div>
                ) : departments.map((dept) => (
                    <div key={dept.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${dept.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                    {dept.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{dept.name}</h3>
                            {dept.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{dept.description}</p>}
                            {dept.head_user && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Head: <span className="font-medium text-gray-700 dark:text-gray-300">{dept.head_user.name}</span>
                                </p>
                            )}
                        </div>
                        <div className="mt-4 flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button onClick={() => openEdit(dept)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Edit</button>
                            <button onClick={() => setDeleteConfirm(dept)} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingDept ? 'Edit Department' : 'Create Department'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{error}</div>}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department Name *</label>
                                <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department Head</label>
                                <select value={form.head_user_id} onChange={e => setForm(f => ({ ...f, head_user_id: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">— None —</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="dept_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                                <label htmlFor="dept_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : editingDept ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Department?</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? Employees assigned to this department will be unlinked.
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
