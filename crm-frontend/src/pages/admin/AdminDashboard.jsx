import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard');
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
                {error}
            </div>
        );
    }

    const { stats, recent_leaves, recent_tasks } = data || {};

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Super Admin Dashboard</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Enterprise control panel and system monitoring statistics.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Employees */}
                <div className="bg-white dark:bg-slate-900 overflow-hidden shadow rounded-xl border border-gray-200/60 dark:border-slate-800/80 hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500/10 p-3 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Employees</dt>
                                    <dd className="text-2xl font-bold text-gray-950 dark:text-white">{stats?.total_employees}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total HR Managers */}
                <div className="bg-white dark:bg-slate-900 overflow-hidden shadow rounded-xl border border-gray-200/60 dark:border-slate-800/80 hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-emerald-500/10 p-3 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HR Managers</dt>
                                    <dd className="text-2xl font-bold text-gray-950 dark:text-white">{stats?.total_hrs}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Present Today */}
                <div className="bg-white dark:bg-slate-900 overflow-hidden shadow rounded-xl border border-gray-200/60 dark:border-slate-800/80 hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500/10 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Present Today</dt>
                                    <dd className="text-2xl font-bold text-gray-950 dark:text-white">
                                        {stats?.present_today} <span className="text-xs font-normal text-gray-500">({stats?.attendance_rate}%)</span>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Leaves */}
                <div className="bg-white dark:bg-slate-900 overflow-hidden shadow rounded-xl border border-gray-200/60 dark:border-slate-800/80 hover:shadow-md transition-all duration-200">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-amber-500/10 p-3 rounded-lg text-amber-600 dark:text-amber-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Leaves</dt>
                                    <dd className="text-2xl font-bold text-gray-950 dark:text-white">{stats?.pending_leaves}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Leaves */}
                <div className="bg-white dark:bg-slate-900 shadow rounded-xl border border-gray-200/60 dark:border-slate-800/80 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Leave Requests</h2>
                    {recent_leaves && recent_leaves.length > 0 ? (
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200 dark:divide-slate-800">
                                {recent_leaves.map((leave) => (
                                    <li key={leave.id} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-950 dark:text-white">{leave.user_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{leave.leave_type} ({leave.total_days} days)</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-500">
                                                    {leave.start_date} to {leave.end_date}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    leave.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    leave.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                                }`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">No recent leave requests.</p>
                    )}
                </div>

                {/* Recent Tasks */}
                <div className="bg-white dark:bg-slate-900 shadow rounded-xl border border-gray-200/60 dark:border-slate-800/80 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Task Delegations</h2>
                    {recent_tasks && recent_tasks.length > 0 ? (
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200 dark:divide-slate-800">
                                {recent_tasks.map((task) => (
                                    <li key={task.id} className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-950 dark:text-white">{task.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Assigned to: {task.assignee_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                    task.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                                }`}>
                                                    {task.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">No recent task delegations.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
