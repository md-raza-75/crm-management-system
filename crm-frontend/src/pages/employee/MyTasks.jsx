import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { statusBadge, priorityBadge } from '../../utils/badges';

export default function MyTasks() {
    const [tasks, setTasks] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    // Detail Modal
    const [activeTask, setActiveTask] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('/employee/dashboard');
            setStats(res.data.data);
        } catch (e) {
            console.error('Error fetching task stats', e);
        }
    };

    const fetchTasks = async (pageNum = page) => {
        setLoading(true);
        try {
            const params = {
                per_page: 10,
                page: pageNum,
            };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;

            const res = await api.get('/employee/tasks', { params });
            setTasks(res.data.data);
            if (res.data.meta) {
                setMeta(res.data.meta);
            }
        } catch (e) {
            console.error('Error fetching tasks list', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        // Debounce search a bit
        const delayDebounceFn = setTimeout(() => {
            fetchTasks(page);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search, statusFilter, priorityFilter]);

    const handleStatusUpdate = async (taskId, newStatus) => {
        setStatusUpdating(true);
        try {
            await api.put(`/employee/tasks/${taskId}/status`, { status: newStatus });
            
            // Update local state for tasks list
            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
            );

            // Update active details modal if open
            if (activeTask && activeTask.id === taskId) {
                setActiveTask(prev => ({ ...prev, status: newStatus }));
            }

            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update task status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'completed' || status === 'cancelled') return false;
        if (!dueDate) return false;
        return new Date(dueDate) < new Date(new Date().setHours(0,0,0,0));
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Tasks</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your assignments, update task status, and track your deadlines.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Assigned</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {stats?.total_tasks ?? 0}
                    </p>
                </div>
                <div className="bg-amber-50/50 dark:bg-amber-950/10 p-5 rounded-2xl border border-amber-100/50 dark:border-amber-900/10 shadow-sm">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Pending</p>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                        {tasks.filter(t => t.status === 'pending').length} <span className="text-xs font-normal text-gray-400">on page</span>
                    </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-950/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-900/10 shadow-sm">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">In Progress</p>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                        {tasks.filter(t => t.status === 'in_progress').length} <span className="text-xs font-normal text-gray-400">on page</span>
                    </p>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/10 shadow-sm">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Completed</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                        {tasks.filter(t => t.status === 'completed').length} <span className="text-xs font-normal text-gray-400">on page</span>
                    </p>
                </div>
            </div>

            {/* List and Filters section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Search & Filters */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Task List</h3>
                        {(search || statusFilter || priorityFilter) && (
                            <button
                                onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }}
                                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                            >
                                Clear Search & Filters ✕
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Search Keywords</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search title or details..."
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cards List container */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-3 text-sm text-gray-500">Loading task log...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-300 text-4xl mb-2">📋</div>
                        <p className="text-gray-500 text-sm font-semibold">No assigned tasks found</p>
                        <p className="text-gray-400 text-xs mt-1">Outstanding assignments will display here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
                        {tasks.map((task) => {
                            const overdue = isOverdue(task.due_date, task.status);
                            return (
                                <div
                                    key={task.id}
                                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/40 dark:hover:bg-slate-800/10 transition-colors"
                                >
                                    {/* Task info */}
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4
                                                onClick={() => setActiveTask(task)}
                                                className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer hover:underline truncate"
                                            >
                                                {task.title}
                                            </h4>
                                            <span className={priorityBadge(task.priority)}>{task.priority}</span>
                                            {overdue && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 uppercase tracking-wide">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pr-6">
                                            {task.description || 'No detailed instructions provided.'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-slate-500 pt-0.5">
                                            <span>Due: <strong className={overdue ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}>{task.due_date}</strong></span>
                                            <span>Assigned by: <strong className="text-gray-500 dark:text-gray-400">{task.creator?.name || 'Manager'}</strong></span>
                                        </div>
                                    </div>

                                    {/* Status selection and actions */}
                                    <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                                        <label className="text-xs text-gray-400 dark:text-slate-500 md:hidden">Status:</label>
                                        <select
                                            disabled={statusUpdating}
                                            value={task.status}
                                            onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                            className="border border-gray-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <button
                                            onClick={() => setActiveTask(task)}
                                            className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Showing page <strong>{meta.current_page}</strong> of <strong>{meta.last_page}</strong> ({meta.total} records)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={meta.current_page === 1}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                disabled={meta.current_page === meta.last_page}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Task Detail & Description */}
            {activeTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        {/* Header Details */}
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={priorityBadge(activeTask.priority)}>{activeTask.priority}</span>
                                    <span className={statusBadge(activeTask.status)}>{activeTask.status}</span>
                                    {isOverdue(activeTask.due_date, activeTask.status) && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 uppercase tracking-wide">
                                            Overdue
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-2">
                                    {activeTask.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveTask(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h5>
                                <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800/60">
                                    {activeTask.description || 'No detailed instructions provided.'}
                                </p>
                            </div>

                            {/* Additional metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase">Due Date</span>
                                    <strong className="text-gray-800 dark:text-slate-200 text-sm mt-0.5 block">{activeTask.due_date || '—'}</strong>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase">Assigned By</span>
                                    <strong className="text-gray-800 dark:text-slate-200 text-sm mt-0.5 block">{activeTask.creator?.name || 'Manager'}</strong>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase">Created At</span>
                                    <span className="text-gray-600 dark:text-slate-400 block mt-0.5">{activeTask.created_at || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase">Completed At</span>
                                    <span className="text-gray-600 dark:text-slate-400 block mt-0.5">{activeTask.completed_at || '—'}</span>
                                </div>
                            </div>

                            {/* Actions inside modal */}
                            <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Update status:</span>
                                    <select
                                        disabled={statusUpdating}
                                        value={activeTask.status}
                                        onChange={(e) => handleStatusUpdate(activeTask.id, e.target.value)}
                                        className="border border-gray-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setActiveTask(null)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
