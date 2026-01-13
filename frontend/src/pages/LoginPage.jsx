import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we arrived here via "Login as Admin"
    const isAdminMode = location.state?.isAdminMode || false;

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- VALIDATION ---
        if (!/^[a-zA-Z]/.test(credentials.username)) {
            setError('Username must start with a letter.');
            setLoading(false);
            return;
        }

        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(credentials.username)) {
            setError('Username can only contain letters, numbers, and underscores (_).');
            setLoading(false);
            return;
        }

        if (credentials.password.length < 8) {
            setError('Password must be at least 8 characters.');
            setLoading(false);
            return;
        }

        if (!/^[A-Z]/.test(credentials.password)) {
            setError('Password must start with an uppercase letter.');
            setLoading(false);
            return;
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(credentials.password)) {
            setError('Password must contain at least one symbol.');
            setLoading(false);
            return;
        }

        if (!/\d/.test(credentials.password)) {
            setError('Password must contain at least one digit.');
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/login/', credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Fetch profile to check role for redirection
            const profileRes = await api.get('/profile/');
            const user = profileRes.data;

            const pending = localStorage.getItem('pendingNavigation');
            if (pending) {
                try {
                    const p = JSON.parse(pending);
                    localStorage.removeItem('pendingNavigation');
                    navigate(p.to, { state: p.state });
                    return;
                } catch (e) {
                    localStorage.removeItem('pendingNavigation');
                }
            }

            // Conditional redirection based on role
            const adminRoles = ['ADMIN', 'admin', 'super_admin'];
            if (adminRoles.includes(user.role) || user.is_staff) {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Login Error:", err);
            const data = err.response?.data;
            if (data?.detail) {
                setError(data.detail);
            } else if (data && typeof data === 'object') {
                const errorStrings = Object.entries(data).map(([field, msgs]) => {
                    const message = Array.isArray(msgs) ? msgs[0] : msgs;
                    return `${field}: ${message}`;
                });
                setError(errorStrings.join(' | ') || 'Invalid username or password');
            } else if (!err.response) {
                setError(`Connection Error: ${err.message}. Please check if backend is running.`);
            } else {
                setError('Invalid username or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <Navbar />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 100px)',
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    {localStorage.getItem('pendingNavigation') && (
                        <div style={{
                            background: '#FFFBEB',
                            color: '#92400E',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontWeight: '600',
                            border: '1px solid #FEF3C7'
                        }}>
                            ✨ Please login to complete your payment
                        </div>
                    )}
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '30px',
                        fontFamily: 'Playfair Display',
                        color: isAdminMode ? '#c5a059' : '#1a1a1a'
                    }}>{isAdminMode ? 'Admin Access' : 'Login'}</h2>

                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="Letters, numbers, underscore"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Min 8 chars: Uppercase, symbol, digit"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: loading ? '#ccc' : '#c5a059',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                            Don't have an account? <Link to="/register" style={{ color: '#c5a059', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
