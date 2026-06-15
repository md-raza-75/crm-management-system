import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { statusBadge } from '../../utils/badges';

const STATUSES = ['pending', 'approved', 'rejected'];

export default function LeaveManagement() {
    const [leaves, setLeaves] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [empFilter, setEmpFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [actionLoading, setActionLoading] = useState({});

    // View details modal
    const [viewLeave, setViewLeave] = useState(null);
    const [actionNote, setActionNote] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/leaves', {
                params: { page, per_page: 10, status: statusFilter, employee_id: empFilter, leave_type_id: typeFilter }
            });
            setLeaves(res.data.data);
            setMeta(res.data.meta || {});
        } catch (e) {
            console.error('Fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, empFilter, typeFilter]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    useEffect(() => {
        api.get('/hr/employees', { params: { per_page: 200 } }).then(r => setEmployees(r.data.data)).catch(console.error);
        api.get('/leave-types').then(r => setLeaveTypes(r.data.data)).catch(console.error);
    }, []);

    // FIXED: Correct API call for approve/reject
    const handleAction = async (id, action, note = '') => {
        setActionLoading(prev => ({ ...prev, [id]: action }));
        try {
            // Backend expects PUT request to /hr/leaves/{id}/review
            const payload = {
                status: action === 'approve' ? 'approved' : 'rejected',
                review_remarks: note || null
            };

            console.log(`Sending ${action} request for leave ${id}:`, payload);

            const response = await api.put(`/hr/leaves/${id}/review`, payload);

            console.log('Response:', response.data);

            setSuccessMessage(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
            setViewLeave(null);
            setActionNote('');
            fetchLeaves(); // Refresh the list

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (e) {
            console.error('Action error:', e.response?.data);
            alert(e.response?.data?.message || 'Action failed. Please try again.');
        } finally {
            setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
        }
    };

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg border border-green-200 dark:border-green-900/30">
                    {successMessage}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Leave Management</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review, approve, and reject employee leave requests.</p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-150 ${statusFilter === s
                                ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <select
                    value={empFilter}
                    onChange={e => { setEmpFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Employees</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.user?.name}</option>)}
                </select>
                <select
                    value={typeFilter}
                    onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Leave Types</option>
                    {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No {statusFilter} leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                leaves.map(lv => (
                                    <tr key={lv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-400">
                                                    {lv.employee?.user?.name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                        {lv.employee?.user?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{lv.employee?.department?.name || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
                                                {lv.leave_type?.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{lv.start_date}</td>
                                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{lv.end_date}</td>
                                        <td className="px-5 py-3 text-sm font-bold text-gray-900 dark:text-white">{lv.total_days}d</td>
                                        <td className="px-5 py-3 text-sm text-gray-500 max-w-[150px] truncate">{lv.reason || '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={statusBadge(lv.status)}>{lv.status}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => { setViewLeave(lv); setActionNote(''); }}
                                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                                >
                                                    View
                                                </button>
                                                {lv.status === 'pending' && (
                                                    <>
                                                        <button
                                                            disabled={!!actionLoading[lv.id]}
                                                            onClick={() => handleAction(lv.id, 'approve')}
                                                            className="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading[lv.id] === 'approve' ? '...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            disabled={!!actionLoading[lv.id]}
                                                            onClick={() => setViewLeave({ ...lv, _reject: true })}
                                                            className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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
                        >
                            ← Prev
                        </button>
                        <button
                            disabled={page === meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* View / Reject Modal */}
            {viewLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leave Request Details</h2>
                            <button
                                onClick={() => setViewLeave(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Employee', viewLeave.employee?.user?.name],
                                    ['Department', viewLeave.employee?.department?.name || '—'],
                                    ['Leave Type', viewLeave.leave_type?.name],
                                    ['Duration', `${viewLeave.start_date} → ${viewLeave.end_date} (${viewLeave.total_days}d)`],
                                    ['Status', viewLeave.status],
                                    ['Applied On', viewLeave.created_at?.slice(0, 10)],
                                ].map(([label, val]) => (
                                    <div key={label}>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize mt-0.5">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {viewLeave.reason && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Reason</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2">{viewLeave.reason}</p>
                                </div>
                            )}

                            {viewLeave.review_remarks && (
                                <div>
                                    <p className="text-xs font-semibold text-red-500 uppercase mb-1">Review Remarks</p>
                                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{viewLeave.review_remarks}</p>
                                </div>
                            )}

                            {/* Reject reason input */}
                            {viewLeave._reject && viewLeave.status === 'pending' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Rejection Reason (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={actionNote}
                                        onChange={e => setActionNote(e.target.value)}
                                        placeholder="Optional reason for rejection..."
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                    />
                                </div>
                            )}

                            {viewLeave.status === 'pending' && (
                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
                                    {!viewLeave._reject ? (
                                        <>
                                            <button
                                                onClick={() => handleAction(viewLeave.id, 'approve')}
                                                disabled={!!actionLoading[viewLeave.id]}
                                                className="px-5 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading[viewLeave.id] === 'approve' ? 'Approving...' : '✓ Approve'}
                                            </button>
                                            <button
                                                onClick={() => setViewLeave({ ...viewLeave, _reject: true })}
                                                className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                ✗ Reject
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setViewLeave({ ...viewLeave, _reject: false })}
                                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => handleAction(viewLeave.id, 'reject', actionNote)}
                                                disabled={!!actionLoading[viewLeave.id]}
                                                className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading[viewLeave.id] === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}