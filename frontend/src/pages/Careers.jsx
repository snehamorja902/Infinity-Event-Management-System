import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const openPositions = [
    { id: 1, title: 'Event Coordinator', type: 'Full-Time', location: 'Surat', description: 'Spearhead end-to-end planning and execution for luxury events.' },
    { id: 2, title: 'Hospitality Manager', type: 'Full-Time', location: 'Surat', description: 'Ensure seamless guest experiences and top-tier service standards.' },
    { id: 3, title: 'Lead Decor Stylist', type: 'Contract', location: 'Surat', description: 'Transform venues with breathtaking floral and conceptual designs.' },
    { id: 4, title: 'Catering Supervisor', type: 'Full-Time', location: 'Surat', description: 'Oversee gourmet culinary presentations and banquet logistics.' },
    { id: 5, title: 'Logistics Coordinator', type: 'Full-Time', location: 'Surat', description: 'Manage site setup, vendor coordination, and equipment flow.' },
    { id: 6, title: 'Client Relationship Manager', type: 'Full-Time', location: 'Surat', description: 'Build and maintain strong relationships with our premium clientele.' },
    { id: 7, title: 'Social Media Content Creator', type: 'Part-Time', location: 'Surat', description: 'Capture and share the magic of our events across digital platforms.' },
    { id: 8, title: 'Site Operations Lead', type: 'Full-Time', location: 'Surat', description: 'Oversee on-site technical and structural event requirements.' },
];

const Careers = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const [selectedJob, setSelectedJob] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        portfolio: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });

    useEffect(() => {
        if (token) {
            api.get('/profile/')
                .then(res => {
                    setFormData(prev => ({
                        ...prev,
                        fullName: res.data.username || '',
                        email: res.data.email || '',
                    }));
                })
                .catch(err => console.error("Profile fetch error", err));
        }
    }, [token]);

    const handleApply = (job) => {
        if (!token) {
            setCustomAlert({
                show: true,
                title: 'AUTH REQUIRED',
                message: 'Please login to apply for this position.'
            });
            setTimeout(() => navigate('/login'), 2500);
            return;
        }
        setSelectedJob(job);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post('/careers/apply/', {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                portfolio: formData.portfolio,
                message: formData.message,
                position: selectedJob.title
            });

            console.log('Application Submitted Successfully');
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSelectedJob(null);
                setFormData({ fullName: '', email: '', phone: '', portfolio: '', message: '' });
            }, 3000);
        } catch (error) {
            console.error("Application Failed:", error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            setCustomAlert({
                show: true,
                title: 'FAILED',
                message: "Failed to submit application: " + msg
            });
        }
    };
    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                height: '50vh',
                backgroundImage: 'url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '8px', fontFamily: 'var(--font-heading)', margin: 0 }}>Join Our Team</h1>
                    <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '20px auto' }}></div>
                    <p style={{ fontSize: '1.2rem', fontWeight: '300', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Crafting Experiences, Building Careers</p>
                </div>
            </header>

            {/* Why Work With Us */}
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Why Infinity?</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '40px',
                    marginBottom: '80px'
                }}>
                    <div style={{ padding: '30px', background: '#f9f9f9', borderRadius: '4px' }}>
                        <h3 style={{ color: 'var(--color-gold)', marginBottom: '15px' }}>Global Reach</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Work on world-class destination events across the globe.</p>
                    </div>
                    <div style={{ padding: '30px', background: '#f9f9f9', borderRadius: '4px' }}>
                        <h3 style={{ color: 'var(--color-gold)', marginBottom: '15px' }}>Creative Freedom</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>We value innovation and fresh perspectives in event design.</p>
                    </div>
                    <div style={{ padding: '30px', background: '#f9f9f9', borderRadius: '4px' }}>
                        <h3 style={{ color: 'var(--color-gold)', marginBottom: '15px' }}>Growth</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Clear career paths and mentorship from industry leaders.</p>
                    </div>
                </div>

                <div style={{ width: '40px', height: '1px', backgroundColor: '#ddd', margin: '0 auto 80px' }}></div>

                {/* Open Positions */}
                <h2 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Open Positions</h2>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
                    {openPositions.map(job => (
                        <div key={job.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '25px',
                            borderBottom: '1px solid #eee',
                            gap: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', color: 'var(--color-dark)' }}>{job.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 12px 0', maxWidth: '500px' }}>{job.description}</p>
                                <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', gap: '15px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <span>{job.type}</span>
                                    <span>&bull;</span>
                                    <span>{job.location}</span>
                                </div>
                            </div>
                            <button style={{
                                padding: '10px 25px',
                                backgroundColor: 'var(--color-dark)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-gold)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--color-dark)'}
                                onClick={() => handleApply(job)}
                            >Apply Now</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Application Modal */}
            {selectedJob && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '40px', borderRadius: '8px',
                        maxWidth: '500px', width: '100%', position: 'relative',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        {!submitted ? (
                            <>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                                >&times;</button>

                                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>Apply for {selectedJob.title}</h2>
                                <p style={{ color: '#666', marginBottom: '30px' }}>Please provide your details below.</p>

                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Portfolio / LinkedIn URL</label>
                                        <input
                                            type="url"
                                            value={formData.portfolio}
                                            onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '30px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Cover Message</label>
                                        <textarea
                                            rows="4"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                                        ></textarea>
                                    </div>
                                    <button type="submit" style={{
                                        width: '100%', padding: '15px', backgroundColor: 'var(--color-gold)',
                                        color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700',
                                        textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer'
                                    }}>Submit Application</button>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '4rem', color: '#4CAF50', marginBottom: '20px' }}>&check;</div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Application Sent!</h2>
                                <p style={{ color: '#666' }}>Thank you for applying. Our team will review your profile and get back to you shortly.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{ padding: '80px 20px', backgroundColor: 'var(--color-dark)', color: '#fff', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '20px' }}>Infinity Hospitality</h3>
                <p style={{ opacity: 0.6 }}>&copy; 2025 All Rights Reserved.</p>
            </footer>
            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
            />
        </div>
    );
};

export default Careers;
