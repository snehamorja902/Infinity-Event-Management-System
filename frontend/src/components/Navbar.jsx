import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        if (token) {
            API.get('profile/')
                .then(res => setUser(res.data))
                .catch(() => setUser(null));
        }
    }, [token]);

    const isAdmin = user?.role === 'ADMIN' || user?.is_staff || user?.is_superuser;

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const isActive = (path) => window.location.pathname === path;

    const navItemStyle = (path) => ({
        cursor: 'pointer',
        color: isActive(path) ? '#C4A059' : '#1a1a1a',
        fontWeight: isActive(path) ? '800' : '600',
        borderBottom: isActive(path) ? '2px solid #C4A059' : 'none',
        paddingBottom: '5px',
        transition: 'all 0.3s ease'
    });

    const dropdownBtnStyle = (bg) => ({
        background: bg,
        color: bg === '#fff' ? '#1a1a1a' : '#fff',
        border: 'none',
        padding: '12px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: '0.3s'
    });

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px 0',
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
            {/* Left Links */}
            <div style={{ display: 'flex', gap: '30px', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <span onClick={() => navigate('/')} style={navItemStyle('/')}>Home</span>
                <span onClick={() => navigate('/about')} style={navItemStyle('/about')}>About Us</span>
                <span onClick={() => navigate('/gallery')} style={navItemStyle('/gallery')}>Gallery</span>
            </div>

            {/* Logo */}
            <div style={{ margin: '0 60px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div style={{ fontSize: '1.8rem', fontFamily: 'serif', letterSpacing: '4px', fontWeight: 'bold', color: '#1a1a1a' }}>
                    INFINITY
                </div>
                <div style={{ fontSize: '0.75rem', letterSpacing: '3px', color: '#777', textTransform: 'uppercase', marginTop: '2px' }}>
                    Hospitality
                </div>
            </div>

            {/* Right Links */}
            <div style={{ display: 'flex', gap: '30px', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', alignItems: 'center' }}>

                <span onClick={() => navigate('/blog')} style={navItemStyle('/blog')}>Blog</span>
                <span onClick={() => navigate('/careers')} style={navItemStyle('/careers')}>Employment</span>

                <div style={{ position: 'relative' }}>
                    {/* Profile Icon (Always Visible) */}
                    <div
                        onClick={() => setShowProfile(!showProfile)}
                        style={{
                            width: '50px',
                            height: '50px',
                            background: '#1a1a1a',
                            color: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            border: '3px solid #C4A059',
                            transition: '0.3s ease',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                        }}>
                        {user?.username ? user.username[0].toUpperCase() : '👤'}
                    </div>

                    {/* Dropdown Menu */}
                    {showProfile && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '65px',
                            background: '#fff',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            borderRadius: '20px',
                            width: '280px',
                            padding: '25px',
                            zIndex: 1001,
                            border: '1px solid #eee'
                        }}>
                            {token && user ? (
                                <>
                                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px' }}>{user.username}</div>
                                        <div style={{ fontSize: '13px', color: '#888', textTransform: 'lowercase', marginTop: '3px' }}>{user.email}</div>
                                        {isAdmin && (
                                            <div style={{ fontSize: '10px', color: '#C4A059', fontWeight: '800', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>✨ Administrator</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {isAdmin && (
                                            <button
                                                onClick={() => { navigate('/admin-dashboard'); setShowProfile(false); }}
                                                style={dropdownBtnStyle('#C4A059')}>
                                                Admin Panel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { navigate('/my-bookings'); setShowProfile(false); }}
                                            style={dropdownBtnStyle('#1a1a1a')}>
                                            My Bookings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            style={{ background: 'none', color: '#EF4444', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
                                            SIGN OUT
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ paddingBottom: '15px', marginBottom: '15px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a1a' }}>Welcome to Infinity</div>
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>Login to manage your events</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button
                                            onClick={() => { navigate('/login'); setShowProfile(false); }}
                                            style={dropdownBtnStyle('#C4A059')}>
                                            Login
                                        </button>
                                        <button
                                            onClick={() => { navigate('/register'); setShowProfile(false); }}
                                            style={{ ...dropdownBtnStyle('#fff'), color: '#1a1a1a', border: '1px solid #eee' }}>
                                            Sign Up
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
