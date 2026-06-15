import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { statusBadge } from '../../utils/badges';

export default function MyAttendance() {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [todayAtt, setTodayAtt] = useState(null);
    const [clockLoading, setClockLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [dashboardStats, setDashboardStats] = useState(null);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchTodayStatus = async () => {
        try {
            const res = await api.get('/employee/attendance/today');
            setTodayAtt(res.data.data);
        } catch (e) {
            console.error('Error fetching today status', e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/employee/dashboard');
            setDashboardStats(res.data.data);
        } catch (e) {
            console.error('Error fetching dashboard stats', e);
        }
    };

    const fetchLogs = async (pageNum = page) => {
        setLoading(true);
        try {
            const params = {
                per_page: 10,
                page: pageNum,
            };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/employee/attendance', { params });
            setLogs(res.data.data);
            if (res.data.meta) {
                setMeta(res.data.meta);
            }
        } catch (e) {
            console.error('Error fetching attendance logs', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayStatus();
        fetchStats();
    }, []);

    useEffect(() => {
        fetchLogs(page);
    }, [page, startDate, endDate, statusFilter]);

    const handleClockIn = async (e) => {
        e.preventDefault();
        setClockLoading(true);
        try {
            const res = await api.post('/employee/attendance/clock-in', { notes });
            setTodayAtt(res.data.data);
            setNotes('');
            setPage(1);
            fetchLogs(1);
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to clock in.');
        } finally {
            setClockLoading(false);
        }
    };

    const handleClockOut = async (e) => {
        e.preventDefault();
        setClockLoading(true);
        try {
            const res = await api.post('/employee/attendance/clock-out', { notes });
            setTodayAtt(res.data.data);
            setNotes('');
            setPage(1);
            fetchLogs(1);
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to clock out.');
        } finally {
            setClockLoading(false);
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
        setPage(1);
    };

    // Calculate time details
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Attendance Log</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Track your daily check-ins, check-outs, work hours, and view historical logs.
                </p>
            </div>

            {/* Top row: Clock Widget & Stats summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clock Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
                            <div>
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Current Date</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{dateStr}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">IP: {todayAtt?.ip_address || 'Detecting...'}</span>
                        </div>

                        {/* Status Message */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status for today:</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className={`w-3.5 h-3.5 rounded-full ${todayAtt?.clock_in ? (todayAtt.clock_out ? 'bg-gray-400' : 'bg-green-500 animate-pulse') : 'bg-amber-500'}`}></span>
                                <span className="font-bold text-gray-800 dark:text-slate-200">
                                    {todayAtt ? (
                                        todayAtt.clock_in && !todayAtt.clock_out
                                            ? `Active Shift (Clocked in at ${todayAtt.clock_in})`
                                            : todayAtt.clock_in && todayAtt.clock_out
                                            ? `Shift Ended (Clocked in at ${todayAtt.clock_in} · Clocked out at ${todayAtt.clock_out})`
                                            : 'Not checked in yet'
                                    ) : 'Not checked in yet'}
                                </span>
                            </div>
                        </div>

                        {/* Notes Input */}
                        {!todayAtt?.clock_out && (
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                    Activity Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={!todayAtt?.clock_in ? "What are you working on today?" : "Any hand-off notes before leaving?"}
                                    rows="2"
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Clock Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        {!todayAtt?.clock_in ? (
                            <button
                                onClick={handleClockIn}
                                disabled={clockLoading}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {clockLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : '🟢'}
                                Clock In
                            </button>
                        ) : !todayAtt?.clock_out ? (
                            <button
                                onClick={handleClockOut}
                                disabled={clockLoading}
                                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-500/10 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {clockLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : '🔴'}
                                Clock Out
                            </button>
                        ) : (
                            <div className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-sm font-semibold rounded-xl border border-gray-200 dark:border-slate-700 flex items-center gap-2">
                                ✓ Today's attendance recorded
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                        Attendance Summary (This Month)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 my-auto">
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/20 p-4 rounded-xl text-center">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Present Days</p>
                            <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                                {dashboardStats?.present_days ?? 0}
                            </p>
                        </div>
                        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/20 p-4 rounded-xl text-center">
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Absent Days</p>
                            <p className="text-3xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                                {dashboardStats?.absent_days ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>Leave Balance: <strong>{dashboardStats?.leave_balance ?? 0}</strong></span>
                        <span>Total Tasks: <strong>{dashboardStats?.total_tasks ?? 0}</strong></span>
                    </div>
                </div>
            </div>

            {/* History section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Search & Filters */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Attendance History</h3>
                        {(startDate || endDate || statusFilter) && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                            >
                                Clear Filters ✕
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="half_day">Half Day</option>
                                <option value="late">Late</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-3 text-sm text-gray-500">Loading history logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-300 text-4xl mb-2">🗓️</div>
                        <p className="text-gray-500 text-sm font-semibold">No attendance records found</p>
                        <p className="text-gray-400 text-xs mt-1">Try adjusting your filter settings or check in for today.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 dark:bg-slate-800/40 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Clock In</th>
                                    <th className="px-6 py-4">Clock Out</th>
                                    <th className="px-6 py-4 text-center">Total Hours</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 text-gray-700 dark:text-slate-300 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            {log.date}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                            {log.clock_in || '—'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                            {log.clock_out || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800 dark:text-slate-200">
                                            {log.total_hours !== null && log.total_hours !== undefined ? `${log.total_hours} hrs` : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={statusBadge(log.status)}>
                                                {log.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            {log.ip_address || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-500 dark:text-gray-400" title={log.notes}>
                                            {log.notes || '—'}
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
        </div>
    );
}
