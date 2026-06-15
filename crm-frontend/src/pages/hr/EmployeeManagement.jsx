import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { statusBadge } from '../../utils/badges';

const emptyForm = {
    name: '', email: '', password: '', phone: '',
    role: 'employee', department_id: '', designation: '',
    date_of_birth: '', gender: 'male', address: '', city: '', state: '', zip_code: '',
    joining_date: new Date().toISOString().slice(0, 10),
    salary: '', employment_type: 'full_time', status: 'active',
    emergency_contact_name: '', emergency_contact_phone: '',
};

const GENDERS = ['male', 'female', 'other'];
const EMP_TYPES = ['full_time', 'part_time', 'contract', 'intern'];
const EMP_STATUSES = ['active', 'inactive', 'terminated', 'on_leave'];

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/employees', {
                params: { page, per_page: 10, search, department_id: deptFilter, status: statusFilter }
            });
            setEmployees(res.data.data);
            setMeta(res.data.meta);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, search, deptFilter, statusFilter]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
    useEffect(() => {
        api.get('/departments').then(r => setDepartments(r.data.data)).catch(console.error);
    }, []);

    const openCreate = () => { setEditingEmp(null); setForm(emptyForm); setError(''); setShowModal(true); };
    const openEdit = (emp) => {
        setEditingEmp(emp);
        setForm({
            name: emp.user?.name || '', email: emp.user?.email || '', password: '',
            phone: emp.user?.phone || '', role: emp.user?.roles?.[0] || 'employee',
            department_id: emp.department?.id || '', designation: emp.designation || '',
            date_of_birth: emp.date_of_birth || '', gender: emp.gender || 'male',
            address: emp.address || '', city: emp.city || '', state: emp.state || '',
            zip_code: emp.zip_code || '', joining_date: emp.joining_date || '',
            salary: emp.salary || '', employment_type: emp.employment_type || 'full_time',
            status: emp.status || 'active', emergency_contact_name: emp.emergency_contact_name || '',
            emergency_contact_phone: emp.emergency_contact_phone || '',
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
            if (editingEmp) {
                await api.put(`/hr/employees/${editingEmp.id}`, payload);
            } else {
                await api.post('/hr/employees', payload);
            }
            setShowModal(false);
            fetchEmployees();
        } catch (err) {
            const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Failed to save.';
            setError(msg);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/hr/employees/${id}`);
            setDeleteConfirm(null);
            fetchEmployees();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Employees</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage employee profiles and work records.</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Employee
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search employees..."
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Statuses</option>
                    {EMP_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div></div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                {['Employee', 'Code', 'Department', 'Designation', 'Type', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {employees.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">No employees found.</td></tr>
                            ) : employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                {emp.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.user?.name}</p>
                                                <p className="text-xs text-gray-500">{emp.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">{emp.employee_code}</td>
                                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{emp.department?.name || '—'}</td>
                                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{emp.designation || '—'}</td>
                                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{emp.employment_type?.replace('_', ' ')}</td>
                                    <td className="px-5 py-4"><span className={statusBadge(emp.status)}>{emp.status?.replace('_', ' ')}</span></td>
                                    <td className="px-5 py-4 flex items-center gap-3">
                                        <button onClick={() => openEdit(emp)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Edit</button>
                                        <button onClick={() => setDeleteConfirm(emp)} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">Delete</button>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Page {meta.current_page} of {meta.last_page} — {meta.total} total</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">← Prev</button>
                        <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Next →</button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingEmp ? 'Edit Employee' : 'Create Employee'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-5 overflow-y-auto">
                            {error && <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30">{error}</div>}
                            
                            {/* Account */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Account Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[{l:'Full Name', k:'name', t:'text', r:true},{l:'Email', k:'email', t:'email', r:true},{l:editingEmp?'New Password (blank to keep)':'Password', k:'password', t:'password', r:!editingEmp},{l:'Phone', k:'phone', t:'text', r:false}].map(({l,k,t,r})=>(
                                        <div key={k}>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{l}{r&&' *'}</label>
                                            <input type={t} required={r} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            {['employee','hr_manager'].map(r=><option key={r} value={r}>{r.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Employment */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Employment Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                        <select value={form.department_id} onChange={e=>setForm(f=>({...f,department_id:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">— No Department —</option>
                                            {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                                        <input type="text" value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Joining Date *</label>
                                        <input required type="date" value={form.joining_date} onChange={e=>setForm(f=>({...f,joining_date:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Salary (PKR)</label>
                                        <input type="number" min="0" value={form.salary} onChange={e=>setForm(f=>({...f,salary:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
                                        <select value={form.employment_type} onChange={e=>setForm(f=>({...f,employment_type:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            {EMP_TYPES.map(t=><option key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                                            className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            {EMP_STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : editingEmp ? 'Save Changes' : 'Create Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Employee?</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Deleting <strong>{deleteConfirm.user?.name}</strong> will deactivate their account and soft-delete the employee profile.
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
