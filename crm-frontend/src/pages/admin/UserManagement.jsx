import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';

const ROLES = ['super_admin', 'hr_manager', 'employee'];

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'employee', is_active: true };

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users', { params: { page, per_page: 10, search } });
            setUsers(res.data.data);
            setMeta(res.data.meta);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openCreate = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || '',
            role: user.roles?.[0] || 'employee',
            is_active: user.is_active,
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;

            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, payload);
            } else {
                await api.post('/admin/users', payload);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to save user.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (user) => {
        try {
            await api.put(`/admin/users/${user.id}/toggle-active`);
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            setDeleteConfirm(null);
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">User Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage system users and their role assignments.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-150"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add User
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search users..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {users.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No users found.</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 capitalize">
                                            {user.roles?.[0]?.replace('_', ' ') || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(user)}
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => openEdit(user)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Edit</button>
                                            <button onClick={() => setDeleteConfirm(user)} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {meta.current_page} of {meta.last_page} — {meta.total} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >← Prev</button>
                        <button
                            disabled={page === meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >Next →</button>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{error}</div>}
                            {[
                                { label: 'Full Name', key: 'name', type: 'text', required: true },
                                { label: 'Email Address', key: 'email', type: 'email', required: true },
                                { label: editingUser ? 'New Password (leave blank to keep)' : 'Password', key: 'password', type: 'password', required: !editingUser },
                                { label: 'Phone', key: 'phone', type: 'text', required: false },
                            ].map(({ label, key, type, required }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                                    <input
                                        type={type}
                                        required={required}
                                        value={form[key]}
                                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                    className="w-4 h-4 accent-indigo-600"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Active account</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User?</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
