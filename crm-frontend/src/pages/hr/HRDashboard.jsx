import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { statusBadge } from '../../utils/badges';

const StatCard = ({ label, value, icon, color, to }) => (
    <Link to={to} className={`group bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-xl shrink-0`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value ?? '—'}</p>
        </div>
    </Link>
);

export default function HRDashboard() {
    const [stats, setStats] = useState(null);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [recentTasks, setRecentTasks] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, leavesRes, tasksRes, attRes] = await Promise.all([
                    api.get('/hr/dashboard'),
                    api.get('/hr/leaves', { params: { status: 'pending', per_page: 5 } }),
                    api.get('/hr/tasks', { params: { per_page: 5 } }),
                    api.get('/hr/attendance/today', { params: { per_page: 8 } }),
                ]);
                setStats(statsRes.data.data);
                setPendingLeaves(leavesRes.data.data);
                setRecentTasks(tasksRes.data.data);
                setTodayAttendance(attRes.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">HR Manager Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of attendance, leaves, and tasks across your team.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Total Employees" value={stats?.total_employees} icon="👥" color="bg-indigo-500" to="/hr/employees" />
                <StatCard label="Present Today" value={stats?.present_today} icon="✅" color="bg-green-500" to="/hr/attendance" />
                <StatCard label="Pending Leaves" value={stats?.pending_leaves} icon="🗓️" color="bg-amber-500" to="/hr/leaves" />
                <StatCard label="Active Tasks" value={stats?.active_tasks} icon="📋" color="bg-blue-500" to="/hr/tasks" />
            </div>

            {/* Pending Leave Requests */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Pending Leave Requests</h2>
                    <Link to="/hr/leaves" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all →</Link>
                </div>
                {pendingLeaves.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-gray-500">No pending leave requests 🎉</div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                        {pendingLeaves.map(lv => (
                            <li key={lv.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{lv.employee?.user?.name}</p>
                                    <p className="text-xs text-gray-500">{lv.leave_type?.name} · {lv.start_date} → {lv.end_date} ({lv.total_days}d)</p>
                                </div>
                                <span className={statusBadge('pending')}>Pending</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Attendance */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Today's Attendance</h2>
                        <Link to="/hr/attendance" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Manage →</Link>
                    </div>
                    {todayAttendance.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-gray-500">No attendance records for today.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                            {todayAttendance.map(att => (
                                <li key={att.id} className="px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                            {att.employee?.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{att.employee?.user?.name}</p>
                                            <p className="text-xs text-gray-500">{att.clock_in ? `In: ${att.clock_in}` : 'Not clocked in'}</p>
                                        </div>
                                    </div>
                                    <span className={statusBadge(att.status)}>{att.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Tasks */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Tasks</h2>
                        <Link to="/hr/tasks" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Manage →</Link>
                    </div>
                    {recentTasks.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-gray-500">No tasks found.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                            {recentTasks.map(task => (
                                <li key={task.id} className="px-6 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                                        <p className="text-xs text-gray-500">Assigned to: {task.employee?.user?.name || '—'} · Due: {task.due_date || '—'}</p>
                                    </div>
                                    <span className={statusBadge(task.status)}>{task.status?.replace('_', ' ')}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
