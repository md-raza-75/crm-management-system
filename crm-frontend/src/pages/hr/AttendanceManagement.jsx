import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { statusBadge } from '../../utils/badges';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'half_day', 'work_from_home'];
const today = new Date().toISOString().slice(0, 10);

export default function AttendanceManagement() {
    const [records, setRecords] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Filters
    const [dateFilter, setDateFilter] = useState(today);
    const [empFilter, setEmpFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');

    // Manual entry modal
    const [showManual, setShowManual] = useState(false);
    const [manualForm, setManualForm] = useState({
        employee_id: '', date: today, clock_in: '', clock_out: '', status: 'present', notes: '',
    });
    const [manualSaving, setManualSaving] = useState(false);
    const [manualError, setManualError] = useState('');

    // Edit modal
    const [editRec, setEditRec] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/attendance', {
                params: {
                    page,
                    per_page: 12,
                    date: dateFilter,
                    employee_id: empFilter,
                    status: statusFilter,
                    department_id: deptFilter,
                },
            });
            setRecords(res.data.data);
            setMeta(res.data.meta || {});
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, dateFilter, empFilter, statusFilter, deptFilter]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    useEffect(() => {
        api.get('/hr/employees', { params: { per_page: 200 } }).then(r => setEmployees(r.data.data)).catch(console.error);
        api.get('/departments').then(r => setDepartments(r.data.data)).catch(console.error);
    }, []);

    const handleManualSave = async (e) => {
        e.preventDefault();
        setManualSaving(true);
        setManualError('');
        try {
            await api.post('/hr/attendance', manualForm);
            setShowManual(false);
            fetchRecords();
        } catch (err) {
            setManualError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to save.');
        } finally { setManualSaving(false); }
    };

    const openEdit = (rec) => {
        setEditRec(rec);
        setEditForm({
            clock_in: rec.clock_in || '',
            clock_out: rec.clock_out || '',
            status: rec.status || 'present',
            notes: rec.notes || '',
        });
        setEditError('');
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditSaving(true);
        setEditError('');
        try {
            await api.put(`/hr/attendance/${editRec.id}`, editForm);
            setEditRec(null);
            fetchRecords();
        } catch (err) {
            setEditError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to update.');
        } finally { setEditSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this attendance record?')) return;
        try {
            await api.delete(`/hr/attendance/${id}`);
            fetchRecords();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Attendance Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View, manually log, and correct employee attendance records.</p>
                </div>
                <button onClick={() => { setManualForm({ employee_id: '', date: today, clock_in: '', clock_out: '', status: 'present', notes: '' }); setManualError(''); setShowManual(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Manual Entry
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Date</label>
                    <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Department</label>
                    <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Employee</label>
                    <select value={empFilter} onChange={e => { setEmpFilter(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Employees</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.user?.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                    </select>
                </div>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-3">
                {STATUS_OPTIONS.map(s => {
                    const count = records.filter(r => r.status === s).length;
                    if (!count) return null;
                    return <span key={s} className={`${statusBadge(s)} px-3 py-1 text-xs rounded-full`}>{s.replace('_', ' ')}: {count}</span>;
                })}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div></div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                {['Employee', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Status', 'Notes', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {records.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">No attendance records for this filter.</td></tr>
                            ) : records.map(rec => {
                                let duration = '—';
                                if (rec.clock_in && rec.clock_out) {
                                    const diff = (new Date(`2000-01-01T${rec.clock_out}`) - new Date(`2000-01-01T${rec.clock_in}`)) / 3600000;
                                    duration = diff > 0 ? `${diff.toFixed(1)}h` : '—';
                                }
                                return (
                                    <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                                    {rec.employee?.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{rec.employee?.user?.name}</p>
                                                    <p className="text-xs text-gray-500">{rec.employee?.department?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{rec.date}</td>
                                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{rec.clock_in || '—'}</td>
                                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{rec.clock_out || '—'}</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{duration}</td>
                                        <td className="px-5 py-3"><span className={statusBadge(rec.status)}>{rec.status?.replace('_', ' ')}</span></td>
                                        <td className="px-5 py-3 text-sm text-gray-500 max-w-[120px] truncate">{rec.notes || '—'}</td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex gap-3">
                                                <button onClick={() => openEdit(rec)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Edit</button>
                                                <button onClick={() => handleDelete(rec.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Page {meta.current_page} of {meta.last_page} — {meta.total} total</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">← Prev</button>
                        <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Next →</button>
                    </div>
                </div>
            )}

            {/* Manual Entry Modal */}
            {showManual && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manual Attendance Entry</h2>
                            <button onClick={() => setShowManual(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleManualSave} className="px-6 py-5 space-y-4">
                            {manualError && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{manualError}</div>}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                                <select required value={manualForm.employee_id} onChange={e => setManualForm(f => ({ ...f, employee_id: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">— Select Employee —</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.user?.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                                    <input required type="date" value={manualForm.date} onChange={e => setManualForm(f => ({ ...f, date: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                                    <select required value={manualForm.status} onChange={e => setManualForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Clock In</label>
                                    <input type="time" value={manualForm.clock_in} onChange={e => setManualForm(f => ({ ...f, clock_in: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Clock Out</label>
                                    <input type="time" value={manualForm.clock_out} onChange={e => setManualForm(f => ({ ...f, clock_out: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea rows={2} value={manualForm.notes} onChange={e => setManualForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowManual(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={manualSaving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {manualSaving ? 'Saving...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editRec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Attendance</h2>
                                <p className="text-xs text-gray-500">{editRec.employee?.user?.name} · {editRec.date}</p>
                            </div>
                            <button onClick={() => setEditRec(null)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleEditSave} className="px-6 py-5 space-y-4">
                            {editError && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{editError}</div>}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Clock In</label>
                                    <input type="time" value={editForm.clock_in} onChange={e => setEditForm(f => ({ ...f, clock_in: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Clock Out</label>
                                    <input type="time" value={editForm.clock_out} onChange={e => setEditForm(f => ({ ...f, clock_out: e.target.value }))}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea rows={2} value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setEditRec(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={editSaving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {editSaving ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
