import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const RegisterPage = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        countryCode: '+91',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'USER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Phone number validation - only digits and max length based on country
        if (name === 'phone') {
            const filteredValue = value.replace(/\D/g, '');
            const maxLength = getPhoneMaxLength(userData.countryCode);
            if (filteredValue.length <= maxLength) {
                setUserData({ ...userData, [name]: filteredValue });
            }
            return;
        }

        setUserData({ ...userData, [name]: value });
    };

    const getPhoneMaxLength = (countryCode) => {
        const lengths = {
            '+91': 10,  // India
            '+1': 10,   // USA/Canada
            '+44': 10,  // UK
            '+61': 9,   // Australia
            '+81': 10,  // Japan
            '+86': 11,  // China
            '+33': 9,   // France
            '+49': 11,  // Germany
            '+971': 9,  // UAE
            '+65': 8,   // Singapore
        };
        return lengths[countryCode] || 10;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- USERNAME VALIDATION: Starts with Letter, allows letters, numbers, and underscore ---
        if (!/^[a-zA-Z]/.test(userData.username)) {
            setError('Username must start with a letter.');
            return;
        }

        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(userData.username)) {
            setError('Username can only contain letters, numbers, and underscores (_).');
            return;
        }

        // --- EMAIL VALIDATION: Must be @gmail.com ---
        if (!userData.email.toLowerCase().endsWith('@gmail.com')) {
            setError('Only @gmail.com email addresses are allowed.');
            return;
        }

        // --- PASSWORD VALIDATION: At least 8 characters, starts with uppercase, has symbol and digit ---
        if (userData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (!/^[A-Z]/.test(userData.password)) {
            setError('Password must start with an uppercase letter.');
            return;
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password)) {
            setError('Password must contain at least one symbol.');
            return;
        }

        if (!/\d/.test(userData.password)) {
            setError('Password must contain at least one digit.');
            return;
        }

        // --- PHONE VALIDATION ---
        if (!userData.phone) {
            setError('Phone number is required.');
            return;
        }

        const requiredLength = getPhoneMaxLength(userData.countryCode);
        if (userData.phone.length !== requiredLength) {
            setError(`Phone number must be exactly ${requiredLength} digits for ${userData.countryCode}.`);
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await api.post('/register/', {
                username: userData.username,
                email: userData.email,
                phone: `${userData.countryCode}${userData.phone}`,
                password: userData.password,
                role: userData.role
            });
            setCustomAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Registration successful! You can now access your account.'
            });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const data = err.response?.data;
            let errorMessage = 'Registration failed. Please try again.';
            if (data) {
                if (typeof data === 'string') errorMessage = data;
                else if (typeof data === 'object') {
                    // Combine all field errors into a single string
                    const errorStrings = Object.entries(data).map(([field, msgs]) => {
                        const message = Array.isArray(msgs) ? msgs[0] : msgs;
                        return `${field}: ${message}`;
                    });
                    if (errorStrings.length > 0) errorMessage = errorStrings.join(' | ');
                }
            }
            setError(errorMessage);
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
                padding: '40px 20px'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '450px'
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '30px',
                        fontFamily: 'Playfair Display',
                        color: '#1a1a1a'
                    }}>Join Infinity</h2>

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
                                value={userData.username}
                                onChange={handleChange}
                                placeholder="Letters, numbers, underscore (e.g., namasvi_123)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="example@gmail.com"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number *</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    name="countryCode"
                                    value={userData.countryCode}
                                    onChange={handleChange}
                                    style={{
                                        width: '120px',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="+91">India +91</option>
                                    <option value="+1">USA +1</option>
                                    <option value="+44">UK +44</option>
                                    <option value="+61">Australia +61</option>
                                    <option value="+81">Japan +81</option>
                                    <option value="+86">China +86</option>
                                    <option value="+33">France +33</option>
                                    <option value="+49">Germany +49</option>
                                    <option value="+971">UAE +971</option>
                                    <option value="+65">Singapore +65</option>
                                </select>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={userData.phone}
                                    onChange={handleChange}
                                    placeholder={`${getPhoneMaxLength(userData.countryCode)} digits`}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                                Enter {getPhoneMaxLength(userData.countryCode)} digit phone number
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Min 8 chars: Uppercase, symbol, digit (e.g., Namasvi@123)"
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={userData.confirmPassword}
                                onChange={handleChange}
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
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            Already have an account? <Link to="/login" style={{ color: '#c5a059', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                        </div>
                    </div>
                </div>
            </div>
            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
            />
        </div>
    );
};

export default RegisterPage;
