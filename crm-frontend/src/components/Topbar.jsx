import React from 'react';

export default function Topbar({ user, onMenuOpen, handleLogout, title }) {
    const roleColors = {
        super_admin: 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30',
        hr_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30',
        employee: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
    };

    const roleName = user?.roles?.[0] || 'employee';
    const roleBadgeClass = roleColors[roleName] || roleColors.employee;

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
            {/* Left: Mobile Menu Toggle & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuOpen}
                    className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="text-base font-bold text-gray-800 dark:text-white capitalize tracking-wide">
                    {title}
                </div>
            </div>

            {/* Right: User profile, Role, and Quick Logout */}
            <div className="flex items-center gap-5">
                {/* Role badge */}
                <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${roleBadgeClass}`}>
                    {roleName.replace('_', ' ')}
                </span>

                {/* Profile card preview */}
                <div className="flex items-center gap-3 border-r border-gray-200 dark:border-slate-800 pr-5">
                    <span className="hidden lg:inline text-sm font-semibold text-gray-700 dark:text-slate-300">
                        {user?.name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-sm shadow-inner shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Quick Logout Button */}
                <button
                    onClick={handleLogout}
                    title="Logout from account"
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
