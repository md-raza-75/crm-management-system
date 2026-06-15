import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { statusBadge, priorityBadge } from '../../utils/badges';

const StatCard = ({ label, value, icon, color, to }) => (
    <Link to={to} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-xl shrink-0 group-hover:scale-105 transition-transform`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value ?? '—'}</p>
        </div>
    </Link>
);

export default function EmployeeDashboard() {
    const [stats, setStats] = useState(null);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clockLoading, setClockLoading] = useState(false);
    const [todayAtt, setTodayAtt] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, attRes, leavesRes, tasksRes, todayRes] = await Promise.all([
                api.get('/employee/dashboard'),
                api.get('/employee/attendance', { params: { per_page: 5 } }),
                api.get('/employee/leaves', { params: { status: 'pending', per_page: 3 } }),
                api.get('/employee/tasks', { params: { per_page: 5 } }),
                api.get('/employee/attendance/today'),
            ]);
            setStats(statsRes.data.data);
            setRecentAttendance(attRes.data.data);
            setPendingLeaves(leavesRes.data.data);
            setMyTasks(tasksRes.data.data);
            setTodayAtt(todayRes.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleClockIn = async () => {
        setClockLoading(true);
        try {
            await api.post('/employee/attendance/clock-in');
            fetchAll();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to clock in.');
        } finally { setClockLoading(false); }
    };

    const handleClockOut = async () => {
        setClockLoading(true);
        try {
            await api.post('/employee/attendance/clock-out');
            fetchAll();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to clock out.');
        } finally { setClockLoading(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8">
            {/* Hero Clock Widget */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium">{dateStr}</p>
                        <p className="text-4xl font-extrabold tracking-tight mt-1">{timeStr}</p>
                        <p className="mt-2 text-indigo-200 text-sm">
                            {todayAtt ? (
                                todayAtt.clock_in && !todayAtt.clock_out
                                    ? `⏱ Clocked in at ${todayAtt.clock_in}`
                                    : todayAtt.clock_in && todayAtt.clock_out
                                    ? `✅ Clocked out at ${todayAtt.clock_out}`
                                    : 'Not yet clocked in today'
                            ) : 'Not yet clocked in today'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!todayAtt?.clock_in ? (
                            <button onClick={handleClockIn} disabled={clockLoading}
                                className="px-6 py-3 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-60">
                                {clockLoading ? 'Processing...' : '🟢 Clock In'}
                            </button>
                        ) : !todayAtt?.clock_out ? (
                            <button onClick={handleClockOut} disabled={clockLoading}
                                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-colors shadow-lg border border-white/30 disabled:opacity-60">
                                {clockLoading ? 'Processing...' : '🔴 Clock Out'}
                            </button>
                        ) : (
                            <div className="px-6 py-3 bg-white/10 text-white text-sm rounded-xl border border-white/20 font-medium">
                                Attendance recorded ✓
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Present This Month" value={stats?.present_days} icon="✅" color="bg-green-500" to="/employee/attendance" />
                <StatCard label="Absent This Month" value={stats?.absent_days} icon="❌" color="bg-red-500" to="/employee/attendance" />
                <StatCard label="Leave Balance" value={stats?.leave_balance} icon="🗓️" color="bg-amber-500" to="/employee/leaves" />
                <StatCard label="My Tasks" value={stats?.total_tasks} icon="📋" color="bg-blue-500" to="/employee/tasks" />
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Attendance */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow lg:col-span-1">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Attendance</h2>
                        <Link to="/employee/attendance" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">View all →</Link>
                    </div>
                    {recentAttendance.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-gray-500">No attendance records yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                            {recentAttendance.map(a => (
                                <li key={a.id} className="px-6 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{a.date}</p>
                                        <p className="text-xs text-gray-500">{a.clock_in ? `In: ${a.clock_in}` : '—'} {a.clock_out ? `· Out: ${a.clock_out}` : ''}</p>
                                    </div>
                                    <span className={statusBadge(a.status)}>{a.status?.replace('_', ' ')}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* My Tasks */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/60 dark:border-slate-800 shadow lg:col-span-2">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">My Tasks</h2>
                        <Link to="/employee/tasks" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">View all →</Link>
                    </div>
                    {myTasks.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-gray-500">No tasks assigned.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                            {myTasks.map(t => (
                                <li key={t.id} className="px-6 py-3 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.title}</p>
                                        <p className="text-xs text-gray-500">Due: {t.due_date || '—'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={priorityBadge(t.priority)}>{t.priority}</span>
                                        <span className={statusBadge(t.status)}>{t.status?.replace('_', ' ')}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Pending Leaves */}
            {pendingLeaves.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-amber-500">🕐</span>
                        <h2 className="text-sm font-bold text-amber-900 dark:text-amber-400">Pending Leave Requests</h2>
                    </div>
                    <ul className="space-y-2">
                        {pendingLeaves.map(lv => (
                            <li key={lv.id} className="flex items-center justify-between text-sm text-amber-800 dark:text-amber-300">
                                <span>{lv.leave_type?.name} — {lv.start_date} to {lv.end_date} ({lv.total_days}d)</span>
                                <span className={statusBadge('pending')}>Pending</span>
                            </li>
                        ))}
                    </ul>
                    <Link to="/employee/leaves" className="mt-3 inline-block text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline">Manage leaves →</Link>
                </div>
            )}
        </div>
    );
}
