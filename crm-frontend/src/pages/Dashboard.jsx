import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import HRDashboard from './hr/HRDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.roles?.includes('super_admin')) {
        return <AdminDashboard />;
    }

    if (user?.roles?.includes('hr_manager')) {
        return <HRDashboard />;
    }

    return <EmployeeDashboard />;
};

export default Dashboard;