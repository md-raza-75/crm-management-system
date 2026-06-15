import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children }) => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const pageTitle = location.pathname === '/dashboard'
        ? 'Welcome Dashboard'
        : location.pathname.split('/').pop().replace('-', ' ');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-gray-300 border-r border-slate-800 shrink-0">
                <Sidebar
                    user={user}
                    hasRole={hasRole}
                    currentPath={location.pathname}
                    handleLogout={handleLogout}
                />
            </aside>

            {/* Mobile Header and Sidebar overlay */}
            <div className="md:hidden">
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
                <aside
                    className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-gray-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ${
                        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <Sidebar
                        user={user}
                        hasRole={hasRole}
                        currentPath={location.pathname}
                        onLinkClick={() => setMobileMenuOpen(false)}
                        handleLogout={handleLogout}
                    />
                </aside>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <Topbar
                    user={user}
                    onMenuOpen={() => setMobileMenuOpen(true)}
                    handleLogout={handleLogout}
                    title={pageTitle}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-200">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
