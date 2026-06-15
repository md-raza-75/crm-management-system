import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';

const REPORT_TYPES = ['attendance', 'leave', 'employee'];

const STATUS_COLORS = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
};

const emptyForm = {
    title: '',
    type: 'attendance',
    parameters: { start_date: '', end_date: '', department_id: '', status: '' },
};

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');
    const [departments, setDepartments] = useState([]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports', { params: { page, per_page: 10 } });
            setReports(res.data.data);
            setMeta(res.data.meta);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page]);

    useEffect(() => {
        fetchReports();
        api.get('/departments').then(r => setDepartments(r.data.data)).catch(console.error);
    }, [fetchReports]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setGenError('');
        try {
            const cleanParams = {};
            Object.entries(form.parameters).forEach(([k, v]) => { if (v) cleanParams[k] = v; });
            await api.post('/admin/reports', { ...form, parameters: cleanParams });
            setShowModal(false);
            setForm(emptyForm);
            fetchReports();
        } catch (err) {
            setGenError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to generate report.');
        } finally { setGenerating(false); }
    };

    const handleDownload = async (report) => {
        try {
            const res = await api.get(`/admin/reports/${report.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${report.type}_report_${report.id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error(e);
            alert('Failed to download report.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this report?')) return;
        try {
            await api.delete(`/admin/reports/${id}`);
            fetchReports();
        } catch (e) { console.error(e); }
    };

    const setParam = (key, value) => setForm(f => ({ ...f, parameters: { ...f.parameters, [key]: value } }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate, view, and download structured CSV report files.</p>
                </div>
                <button onClick={() => { setForm(emptyForm); setGenError(''); setShowModal(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" /></svg>
                    Generate Report
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div></div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                {['Title', 'Type', 'Generated By', 'Status', 'Created', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {reports.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No reports generated yet.</td></tr>
                            ) : reports.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 capitalize">
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{r.generated_by_user?.name || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{r.created_at?.slice(0, 10)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {r.status === 'completed' && r.file_path && (
                                                <button onClick={() => handleDownload(r)} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Download</button>
                                            )}
                                            <button onClick={() => handleDelete(r.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">Delete</button>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Page {meta.current_page} of {meta.last_page}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">← Prev</button>
                        <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Next →</button>
                    </div>
                </div>
            )}

            {/* Generate Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-800">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate New Report</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="px-6 py-5 space-y-4">
                            {genError && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{genError}</div>}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Report Title (optional)</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Leave blank for auto-title"
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Report Type *</label>
                                <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {REPORT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            {(form.type === 'attendance' || form.type === 'leave') && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                                        <input required type="date" value={form.parameters.start_date} onChange={e => setParam('start_date', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                                        <input required type="date" value={form.parameters.end_date} onChange={e => setParam('end_date', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Filter by Department</label>
                                <select value={form.parameters.department_id} onChange={e => setParam('department_id', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">— All Departments —</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={generating} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {generating ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
