import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeList = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value);
    return [];
};

const normalizeUser = (userData) => {
    if (!userData) return null;

    return {
        ...userData,
        roles: normalizeList(userData.roles),
        permissions: normalizeList(userData.permissions),
    };
};

/**
 * Returns the correct dashboard path based on the user's primary role.
 */
const getDashboardPath = (userData) => {
    const roles = normalizeList(userData?.roles);
    if (roles.includes('super_admin')) return '/dashboard';
    if (roles.includes('hr_manager')) return '/dashboard';
    return '/dashboard';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearAuth = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(normalizeUser(response.data.user));
        } catch (error) {
            console.error('Fetch user error:', error);
            clearAuth();
        } finally {
            setLoading(false);
        }
    }, [clearAuth]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    useEffect(() => {
        const handleUnauthorized = () => clearAuth();
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [clearAuth]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data;

        if (!newToken || !userData) {
            throw new Error('Invalid login response from server');
        }

        localStorage.setItem('token', newToken);
        const normalizedUser = normalizeUser(userData);
        setUser(normalizedUser);
        setLoading(false);

        return {
            ...response.data,
            user: normalizedUser,
            redirectTo: getDashboardPath(normalizedUser),
        };
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        const { token: newToken, user: newUser } = response.data;

        if (!newToken || !newUser) {
            throw new Error('Invalid registration response from server');
        }

        localStorage.setItem('token', newToken);
        const normalizedUser = normalizeUser(newUser);
        setUser(normalizedUser);
        setLoading(false);

        return {
            ...response.data,
            user: normalizedUser,
            redirectTo: getDashboardPath(normalizedUser),
        };
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuth();
        }
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    const hasPermission = (permission) => {
        return user?.permissions?.includes(permission) || false;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, hasRole, hasPermission, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
