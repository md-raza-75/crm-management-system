import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { statusBadge } from '../../utils/badges';

export default function MyLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [balances, setBalances] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [balanceLoading, setBalanceLoading] = useState(true);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });

    // Cancel state
    const [cancelId, setCancelId] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchBalances = async () => {
        setBalanceLoading(true);
        try {
            const res = await api.get('/employee/leaves/balance');
            setBalances(res.data.data);
            // Pre-select first leave type with remaining days > 0 in form
            if (res.data.data?.length > 0) {
                setForm(f => ({ ...f, leave_type_id: res.data.data[0].leave_type_id.toString() }));
            }
        } catch (e) {
            console.error('Error fetching leave balances', e);
        } finally {
            setBalanceLoading(false);
        }
    };

    const fetchLeaves = async (pageNum = page) => {
        setLoading(true);
        try {
            const params = {
                per_page: 10,
                page: pageNum,
            };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.leave_type_id = typeFilter;

            const res = await api.get('/employee/leaves', { params });
            setLeaves(res.data.data);
            if (res.data.meta) {
                setMeta(res.data.meta);
            }
        } catch (e) {
            console.error('Error fetching leaves list', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    useEffect(() => {
        fetchLeaves(page);
    }, [page, statusFilter, typeFilter]);

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');
        try {
            await api.post('/employee/leaves', {
                leave_type_id: parseInt(form.leave_type_id),
                start_date: form.start_date,
                end_date: form.end_date,
                reason: form.reason,
            });
            setShowModal(false);
            setForm(f => ({ ...f, start_date: '', end_date: '', reason: '' }));
            setPage(1);
            fetchLeaves(1);
            fetchBalances();
        } catch (err) {
            setModalError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to submit leave request.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelLeave = async () => {
        if (!cancelId) return;
        setCancelling(true);
        try {
            await api.put(`/employee/leaves/${cancelId}/cancel`);
            setCancelId(null);
            fetchLeaves(page);
            fetchBalances();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel leave request.');
        } finally {
            setCancelling(false);
        }
    };

    const getLeaveTypeName = (typeId) => {
        const found = balances.find(b => b.leave_type_id === typeId);
        return found ? found.name : 'Leave';
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Leaves</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Check your leave balance, submit requests, and check leave logs.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all flex items-center gap-2 self-start sm:self-center"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Apply for Leave
                </button>
            </div>

            {/* Balances Section */}
            {balanceLoading ? (
                <div className="flex justify-center p-8 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            ) : balances.length === 0 ? (
                <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl text-center text-sm text-gray-500">
                    No leave categories assigned to your profile.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {balances.map((b) => {
                        const usagePct = b.max_days > 0 ? (b.used / b.max_days) * 100 : 0;
                        return (
                            <div key={b.leave_type_id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm p-5 space-y-4 hover:shadow transition-shadow">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate pr-2" title={b.name}>
                                        {b.name}
                                    </h3>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${b.is_paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'}`}>
                                        {b.is_paid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                            {b.remaining} <span className="text-xs text-gray-400 font-normal">days left</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Quota: {b.max_days} days · Used: {b.used}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 text-sm font-bold text-gray-500 dark:text-gray-400 shrink-0">
                                        🌴
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            usagePct > 80
                                                ? 'bg-rose-500'
                                                : usagePct > 50
                                                ? 'bg-amber-500'
                                                : 'bg-indigo-600'
                                        }`}
                                        style={{ width: `${Math.min(100, usagePct)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* History Table / Requests Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Search & Filters */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Leave Application History</h3>
                        {(statusFilter || typeFilter) && (
                            <button
                                onClick={() => { setStatusFilter(''); setTypeFilter(''); setPage(1); }}
                                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                            >
                                Clear Filters ✕
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Leave Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Types</option>
                                {balances.map(b => (
                                    <option key={b.leave_type_id} value={b.leave_type_id}>{b.name}</option>
                                ))}
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
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table list */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-3 text-sm text-gray-500">Loading leave requests...</p>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-300 text-4xl mb-2">🌴</div>
                        <p className="text-gray-500 text-sm font-semibold">No leave applications found</p>
                        <p className="text-gray-400 text-xs mt-1">Try applying for a new leave or check your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 dark:bg-slate-800/40 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-6 py-4">Leave Type</th>
                                    <th className="px-6 py-4">Leave Dates</th>
                                    <th className="px-6 py-4 text-center">Total Days</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">HR Remarks</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
                                {leaves.map((lv) => (
                                    <tr key={lv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 text-gray-700 dark:text-slate-300 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            {lv.leave_type?.name || getLeaveTypeName(lv.leave_type_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                                            {lv.start_date} <span className="text-gray-400 dark:text-slate-600">to</span> {lv.end_date}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800 dark:text-slate-200">
                                            {lv.total_days} d
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={statusBadge(lv.status)}>
                                                {lv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-500 dark:text-gray-400" title={lv.reason}>
                                            {lv.reason}
                                        </td>
                                        <td className="px-6 py-4 text-xs max-w-xs text-gray-500 dark:text-gray-400">
                                            {lv.review_remarks ? (
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Remarks:</span>
                                                    <p className="italic">"{lv.review_remarks}"</p>
                                                </div>
                                            ) : lv.reviewed_at ? (
                                                <span className="text-gray-400">Reviewed ✓</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {lv.status === 'pending' && (
                                                <button
                                                    onClick={() => setCancelId(lv.id)}
                                                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold border border-red-200 dark:border-red-900/30 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                                >
                                                    Cancel Request
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

            {/* Modal: Apply Leave */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span>🌴</span> Apply for Leave
                        </h3>

                        {modalError && (
                            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/30 mb-4">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleApplyLeave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Leave Type</label>
                                <select
                                    required
                                    value={form.leave_type_id}
                                    onChange={(e) => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {balances.map(b => (
                                        <option key={b.leave_type_id} value={b.leave_type_id}>
                                            {b.name} ({b.remaining} remaining)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.start_date}
                                        onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Reason for Leave</label>
                                <textarea
                                    required
                                    value={form.reason}
                                    onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                                    placeholder="Please describe why you need this leave..."
                                    rows="3"
                                    maxLength="1000"
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Cancel */}
            {cancelId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl p-6 relative animate-in fade-in zoom-in duration-150">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Cancel Leave Request?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to cancel this pending leave request? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setCancelId(null)}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCancelLeave}
                                disabled={cancelling}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
