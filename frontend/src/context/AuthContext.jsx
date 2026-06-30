import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);
const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api`,
    withCredentials: true
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await API.get('/admin/me');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('hms_user');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (loginId, password, loginType = 'admin') => {
        try {
            const response = await API.post('/admin/login', { loginId, password, loginType });
            const userData = response.data;

            setUser(userData);
            localStorage.setItem('hms_user', JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await API.post('/admin/logout');
            setUser(null);
            localStorage.removeItem('hms_user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getAdmins = async () => {
        try {
            console.log('Fetching admins from /admin/all...');
            const response = await API.get('/admin/all');
            console.log('AuthContext: Admins fetched:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to fetch administrators');
            return [];
        }
    };

    const hasPermission = (module, action = 'view') => {
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return user.permissions?.[module]?.[action] === true;
    };

    const updateProfile = async (data) => {
        try {
            const response = await API.put('/admin/me', data);
            setUser(response.data);
            localStorage.setItem('hms_user', JSON.stringify(response.data));
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed'
            };
        }
    };

    const updateAdmin = async (id, data) => {
        try {
            const response = await API.put(`/admin/${id}`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Update failed'
            };
        }
    };

    const deleteAdmin = async (id) => {
        try {
            await API.delete(`/admin/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Deletion failed'
            };
        }
    };

    const addAdmin = async (data) => {
        try {
            const response = await API.post('/admin', { ...data, isAdmin: true });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            getAdmins,
            updateAdmin,
            deleteAdmin,
            addAdmin,
            updateProfile,
            hasPermission,
            loading,
            isAdmin: user?.isAdmin || user?.role === 'admin' || user?.role === 'superadmin',
            isSuperAdmin: user?.role === 'superadmin',
            role: user?.role || 'student'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
