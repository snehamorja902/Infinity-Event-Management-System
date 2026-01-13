import React from 'react';
import Navbar from '../components/Navbar';

const About = () => {
    return (
        <div>
            <Navbar />

            {/* Page Header */}
            <div style={{
                position: 'relative', // Added for overlay positioning
                height: '50vh',
                minHeight: '400px',
                backgroundImage: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)' // Darker black overlay
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>Our Story</h1>
                    <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '30px', fontFamily: 'Playfair Display' }}>Crafting unforgettable moments since 2010</p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container" style={{ padding: '80px 20px', maxWidth: '900px' }}>
                <div style={{ paddingBottom: '60px', borderBottom: '1px solid #eee', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#c5a059', textAlign: 'center' }}>Who We Are</h2>
                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.8', marginBottom: '20px' }}>
                        Welcome to <strong>Infinity Hospitality</strong>, where we believe that every event is an art form.
                        Born from a passion for perfection and a love for celebration, we have established ourselves as
                        premier creators of luxury weddings, corporate galas, and exclusive private parties.
                    </p>
                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.8' }}>
                        Our team of dedicated planners, designers, and logistical experts work tirelessly to transform your vision
                        into reality. Whether it's an intimate beach ceremony at sunset or a grand ballroom reception,
                        we handle every detail with precision, grace, and style.
                    </p>
                </div>

                {/* Values Section */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '50px', color: '#1a1a1a' }}>Our Core Values</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <div style={{ padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#c5a059' }}>Excellence</h3>
                            <p style={{ color: '#666' }}>We settle for nothing less than perfect. Every napkin fold, every lighting cue, every moment matters.</p>
                        </div>
                        <div style={{ padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#c5a059' }}>Creativity</h3>
                            <p style={{ color: '#666' }}>We push boundaries to create unique, personalized experiences that reflect your individual style.</p>
                        </div>
                        <div style={{ padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#c5a059' }}>Integrity</h3>
                            <p style={{ color: '#666' }}>We treat our clients and partners with honesty, respect, and transparency in all our dealings.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div id="contact-section" style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '60px 20px', textAlign: 'center', marginTop: '40px' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '20px', color: '#c5a059' }}>Ready to plan your dream event?</h3>
                    <p style={{ marginBottom: '40px', color: '#ccc', fontSize: '1.1rem' }}>Get in touch with our elite planning team today.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                        <div>
                            <h4 style={{ color: '#c5a059', marginBottom: '10px' }}>Call Us</h4>
                            <p style={{ color: '#fff' }}>+91 84697 45000</p>
                        </div>
                        <div>
                            <h4 style={{ color: '#c5a059', marginBottom: '10px' }}>Email Us</h4>
                            <p style={{ color: '#fff' }}>info@infinityhospitality.com</p>
                        </div>
                        <div>
                            <h4 style={{ color: '#c5a059', marginBottom: '10px' }}>Location</h4>
                            <p style={{ color: '#fff' }}>Surat, Gujarat, India</p>
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        style={{ backgroundColor: '#c5a059', color: '#fff', padding: '15px 40px', fontSize: '1.1rem', borderRadius: '50px' }}
                        onClick={() => window.location.href = 'mailto:info@infinityhospitality.com'}
                    >
                        Send an Inquiry
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#999', backgroundColor: '#111' }}>
                &copy; 2026 Infinity Hospitality. Elevating every celebration.
            </div>
        </div>
    );
};

export default About;
