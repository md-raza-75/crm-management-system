import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Shared / Dashboard entry
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import LeaveTypeManagement from './pages/admin/LeaveTypeManagement';
import ReportsPage from './pages/admin/ReportsPage';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import AttendanceManagement from './pages/hr/AttendanceManagement';
import LeaveManagement from './pages/hr/LeaveManagement';
import TaskManagement from './pages/hr/TaskManagement';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import MyTasks from './pages/employee/MyTasks';

import { ToastProvider } from './context/ToastContext';

function AppRoutes() {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading CRM Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Main Application Routes (Protected by Auth & Layout) */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            {/* Super Admin Module Protected Routes */}
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <DashboardLayout>
                            <UserManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/departments"
                element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <DashboardLayout>
                            <DepartmentManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/leave-types"
                element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <DashboardLayout>
                            <LeaveTypeManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                        <DashboardLayout>
                            <ReportsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            {/* HR Manager Module Protected Routes */}
            <Route
                path="/hr/employees"
                element={
                    <ProtectedRoute allowedRoles={['hr_manager', 'super_admin']}>
                        <DashboardLayout>
                            <EmployeeManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/hr/attendance"
                element={
                    <ProtectedRoute allowedRoles={['hr_manager', 'super_admin']}>
                        <DashboardLayout>
                            <AttendanceManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/hr/leaves"
                element={
                    <ProtectedRoute allowedRoles={['hr_manager', 'super_admin']}>
                        <DashboardLayout>
                            <LeaveManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/hr/tasks"
                element={
                    <ProtectedRoute allowedRoles={['hr_manager', 'super_admin']}>
                        <DashboardLayout>
                            <TaskManagement />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            {/* Employee Module Protected Routes */}
            <Route
                path="/employee/profile"
                element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <DashboardLayout>
                            <MyProfile />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employee/attendance"
                element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <DashboardLayout>
                            <MyAttendance />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employee/leaves"
                element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <DashboardLayout>
                            <MyLeaves />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employee/tasks"
                element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <DashboardLayout>
                            <MyTasks />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;