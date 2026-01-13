import React, { useState } from 'react';
import api from '../services/api';

const CustomInquiryModal = ({ isOpen, onClose, eventType = 'Weddings' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/custom-inquiry/', {
                ...formData,
                event_type: eventType
            });
            alert('Your customization request has been sent! Check your email for confirmation.');
            onClose();
        } catch (error) {
            console.error('Failed to send inquiry', error);
            alert('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#fff',
                width: '100%',
                maxWidth: '500px',
                borderRadius: '20px',
                padding: '40px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '25px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >&times;</button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        Custom Planning Request
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        Tell us about your dream {eventType} and we'll craft a perfect plan for you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Full Name *</label>
                        <input
                            required
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Email Address *</label>
                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Requirements / Notes *</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Describe your vision, specific requests, or any questions..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        style={{
                            marginTop: '10px',
                            background: 'linear-gradient(135deg, #1D3557 0%, #457B9D 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '15px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: '0.3s',
                            boxShadow: '0 10px 15px -3px rgba(29, 53, 87, 0.3)'
                        }}
                    >
                        {loading ? 'Sending Request...' : 'Send Custom Request →'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomInquiryModal;
