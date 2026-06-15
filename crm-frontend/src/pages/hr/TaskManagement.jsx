import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { statusBadge, priorityBadge } from '../../utils/badges';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

const emptyForm = {
    title: '', description: '', assigned_to: '', priority: 'medium',
    status: 'pending', due_date: '', estimated_hours: '',
};

export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: 10,
            };
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;
            if (search) params.search = search;

            const res = await api.get('/hr/tasks', { params });
            console.log('Tasks fetched:', res.data);

            // Handle both paginated and non-paginated responses
            if (res.data.data) {
                setTasks(res.data.data);
                setMeta({
                    current_page: res.data.current_page || res.data.meta?.current_page || page,
                    last_page: res.data.last_page || res.data.meta?.last_page || 1,
                    total: res.data.total || res.data.meta?.total || 0,
                });
            } else if (Array.isArray(res.data)) {
                setTasks(res.data);
                setMeta({ current_page: 1, last_page: 1, total: res.data.length });
            }
        } catch (e) {
            console.error('Fetch error:', e);
            setError('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, priorityFilter, search]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Fetch users - Multiple fallback methods
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Method 1: Try to fetch from hr/employees and extract user info
                console.log('Fetching employees...');
                const empResponse = await api.get('/hr/employees', { params: { per_page: 200 } });
                console.log('Employees response:', empResponse.data);

                if (empResponse.data.data && empResponse.data.data.length > 0) {
                    const usersList = empResponse.data.data.map(emp => ({
                        id: emp.user_id || emp.user?.id,
                        name: emp.user?.name || emp.name || `Employee ${emp.id}`,
                        email: emp.user?.email || '',
                        employee_code: emp.employee_code
                    })).filter(user => user.id); // Filter out users without ID

                    console.log('Users extracted from employees:', usersList);
                    setUsers(usersList);
                }
            } catch (error) {
                console.error('Error fetching from hr/employees:', error);

                // Method 2: Try direct users endpoint if available
                try {
                    const userResponse = await api.get('/users');
                    console.log('Users from /users:', userResponse.data);
                    if (userResponse.data.data) {
                        setUsers(userResponse.data.data);
                    } else if (Array.isArray(userResponse.data)) {
                        setUsers(userResponse.data);
                    }
                } catch (err) {
                    console.error('Error fetching from /users:', err);

                    // Method 3: Create some demo users if nothing works
                    setUsers([
                        { id: 1, name: 'Demo Employee 1', email: 'demo1@example.com' },
                        { id: 2, name: 'Demo Employee 2', email: 'demo2@example.com' },
                    ]);
                }
            }
        };

        fetchUsers();
    }, []);

    const openCreate = () => {
        setEditingTask(null);
        setForm(emptyForm);
        setError('');
        setValidationErrors({});
        setShowModal(true);
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description || '',
            assigned_to: task.assigned_to || task.assignee?.id || '',
            priority: task.priority || 'medium',
            status: task.status,
            due_date: task.due_date || '',
            estimated_hours: task.estimated_hours || '',
        });
        setError('');
        setValidationErrors({});
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setValidationErrors({});

        try {
            // Payload as per backend expectation
            const payload = {
                title: form.title.trim(),
                description: form.description?.trim() || null,
                assigned_to: parseInt(form.assigned_to), // Convert to integer
                due_date: form.due_date,
                priority: form.priority,
            };

            console.log('Creating task with payload:', payload);

            let response;
            if (editingTask) {
                response = await api.put(`/hr/tasks/${editingTask.id}`, payload);
                setSuccessMessage('Task updated successfully!');
            } else {
                response = await api.post('/hr/tasks', payload);
                setSuccessMessage('Task created successfully!');
            }

            console.log('Task save response:', response.data);

            setShowModal(false);
            await fetchTasks(); // Refresh the list

            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err) {
            console.error('Save error:', err.response?.data);

            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
                setError('Please fix the validation errors below.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to save task. Please check all fields.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/hr/tasks/${id}`);
            setDeleteConfirm(null);
            setSuccessMessage('Task deleted successfully!');
            await fetchTasks();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            console.error('Delete error:', e);
            setError('Failed to delete task.');
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await api.put(`/hr/tasks/${task.id}`, { status: newStatus });
            setSuccessMessage('Status updated successfully!');
            await fetchTasks();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            console.error('Status update error:', e);
            setError('Failed to update status.');
        }
    };

    const getFieldError = (fieldName) => {
        if (validationErrors[fieldName]) {
            return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors[fieldName][0]}</p>;
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg border border-green-200 dark:border-green-900/30 animate-in slide-in-from-top-2">
                    {successMessage}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Task Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and assign tasks to employees.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search tasks..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={priorityFilter}
                    onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                </select>
            </div>

            {/* Tasks Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click "Create Task" to add your first task.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {tasks.map(task => (
                                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                                        {task.description && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        {task.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                                    {task.assignee.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {task.assignee.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={priorityBadge(task.priority)}>{task.priority}</span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {task.due_date || '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                        <select
                                            value={task.status}
                                            onChange={e => handleStatusChange(task, e.target.value)}
                                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        task.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                                }`}
                                        >
                                            {STATUSES.map(s => (
                                                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => openEdit(task)}
                                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(task)}
                                                className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                                            >
                                                Delete
                                            </button>
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
                    <p className="text-sm text-gray-500">
                        Page {meta.current_page} of {meta.last_page} — {meta.total} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                            ← Prev
                        </button>
                        <button
                            disabled={page === meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingTask ? 'Edit Task' : 'Create Task'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Task Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter task title"
                                />
                                {getFieldError('title')}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    placeholder="Enter task description (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Assign To <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.assigned_to}
                                    onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">— Select Employee —</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} {user.employee_code ? `(${user.employee_code})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError('assigned_to')}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Due Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.due_date}
                                        onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {getFieldError('due_date')}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingTask ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Task?</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}