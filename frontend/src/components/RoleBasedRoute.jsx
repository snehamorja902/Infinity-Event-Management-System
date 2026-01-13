import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api';

const RoleBasedRoute = ({ allowedRoles, redirectPath = "/login" }) => {
    const token = localStorage.getItem('access_token');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/profile/')
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('access_token');
                setUser(null);
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #C4A059', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const publicPaths = ['/', '/about', '/gallery', '/events', '/blog', '/careers', '/catering', '/concerts', '/festivals', '/sports'];
    const isActuallyPublic = allowedRoles.includes('USER') && (publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/blog/'));

    if (!token) {
        if (isActuallyPublic) return <Outlet />;
        return <Navigate to="/login" replace />;
    }

    const roleStr = (user?.role || '').toUpperCase();
    const isAdmin = roleStr === 'ADMIN' || user?.is_staff || user?.is_superuser;
    const userRole = isAdmin ? 'ADMIN' : 'USER';

    if (!allowedRoles.includes(userRole)) {
        // If it's a public path, allowed both roles
        if (publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/blog/')) {
            return <Outlet />;
        }
        // Correct logic: Admin trying to access User-Only private pages -> Admin Dashboard
        // User trying to access Admin pages -> Home
        return <Navigate to={userRole === 'ADMIN' ? '/admin-dashboard' : '/'} replace />;
    }

    return <Outlet />;
};

export default RoleBasedRoute;
