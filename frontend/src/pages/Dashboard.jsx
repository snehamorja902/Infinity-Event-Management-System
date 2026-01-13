import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const navigate = useNavigate();

    const cards = [
        { title: 'Weddings', icon: '💍', type: 'Wedding', description: 'Plan your dream destination or local wedding.' },
        { title: 'Events', icon: '🎉', type: 'Event', description: 'Corporate galas, parties, and exclusive gatherings.' },
        { title: 'Decorations', icon: '✨', type: 'Decoration', description: 'Exquisite floral and thematic styling for any occasion.' },
        { title: 'Performers', icon: '🎻', type: 'Performer', description: 'Top-tier entertainers, bands, and live music.' },
        { title: 'Venues', icon: '🏰', type: 'Venue', description: 'Access to the world\'s most exclusive locations.' },
        { title: 'Catering', icon: '🍽️', type: 'Catering', description: 'Gourmet dining experiences tailored to your taste.' },
        { title: 'Concerts', icon: '🎸', type: 'Concert', description: 'Legendary live performances and world-class stage setups.' },
        { title: 'Festivals', icon: '🎊', type: 'Festival', description: 'Vibrant cultural celebrations with energetic vibes and decor.' }
    ];

    const handleClick = (type) => {
        if (type === 'Decoration') {
            navigate('/decoration-catalogue');
        } else if (type === 'Concert') {
            navigate('/dashboard', { state: { openService: 'Grand Concerts' } });
        } else if (type === 'Festival') {
            navigate('/dashboard', { state: { openService: 'Cultural Festivals' } });
        } else {
            navigate('/book-event', { state: { eventType: type } });
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F4E8', minHeight: '100vh', paddingBottom: '80px' }}>
            <Navbar />
            <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontFamily: 'serif', fontSize: '3.5rem', color: '#1A1A1A', marginBottom: '10px' }}>
                        Your Planning Suite
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.1rem', letterSpacing: '1px' }}>
                        CHOOSE A CATEGORY TO BEGIN YOUR JOURNEY
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleClick(card.type)}
                            style={{
                                backgroundColor: '#fff',
                                padding: '50px 30px',
                                borderRadius: '15px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(196, 160, 89, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-15px)';
                                e.currentTarget.style.boxShadow = '0 30px 60px rgba(196, 160, 89, 0.15)';
                                e.currentTarget.style.borderColor = '#C4A059';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(196, 160, 89, 0.1)';
                            }}
                        >
                            <div style={{
                                fontSize: '3.5rem',
                                marginBottom: '25px',
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#F9F4E8',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                fontSize: '1.8rem',
                                color: '#1A1A1A',
                                fontFamily: 'serif',
                                fontWeight: 'bold',
                                marginBottom: '15px'
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                color: '#777',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                padding: '0 20px'
                            }}>
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
