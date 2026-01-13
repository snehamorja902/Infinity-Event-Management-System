import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminLoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login/', credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Fetch profile to verify admin role
            const profileRes = await api.get('/profile/');
            const user = profileRes.data;

            const adminRoles = ['ADMIN', 'admin', 'super_admin'];
            if (adminRoles.includes(user.role) || user.is_staff) {
                navigate('/admin-dashboard');
            } else {
                setError('Access Denied: You do not have administrator privileges.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        } catch (err) {
            console.error("Admin Login Error:", err);
            const data = err.response?.data;
            if (data?.detail) {
                setError(data.detail);
            } else if (!err.response) {
                setError('Connection Error: Please check if backend is running.');
            } else {
                setError('Invalid admin credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
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
                    boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
                    width: '100%',
                    maxWidth: '400px',
                    border: '2px solid #c5a059'
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '30px',
                        fontFamily: 'Playfair Display',
                        color: '#c5a059'
                    }}>Admin Dashboard Access</h2>

                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            borderLeft: '4px solid #c62828'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Admin Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="Enter admin username"
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Admin Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Enter admin password"
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
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Secure Login'}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                        This access is restricted to authorized personnel only.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
