import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const weddingEvents = [
    { id: 1, title: 'Mehendi Ceremony', image: 'https://i.pinimg.com/736x/98/cc/fc/98ccfc256e1598f8a55a0ec82294e658.jpg' },
    { id: 2, title: 'Sangeet Night', image: 'https://img.weddingbazaar.com/photos/pictures/000/497/397/new_medium/RSEngagement21.JPG?1535093183' },
    { id: 3, title: 'Haldi Ceremony', image: 'https://i.pinimg.com/736x/89/e5/1a/89e51acaa9e2df5ab7dd374a10970e7d.jpg' },
    { id: 4, title: 'Engagement Ceremony', image: 'https://assets-news.housing.com/news/wp-content/uploads/2022/01/11220447/wedding-stage-decoration-shutterstock_1193416354-1200x700-compressed.jpg' },
    { id: 5, title: 'Grand Wedding', image: 'https://eventsweb.in/wp-content/uploads/2024/12/pexels-fotographiya-wedding-photography-823737813-29492598-1024x683.jpg' },
    { id: 6, title: 'Gala Reception', image: 'https://i.pinimg.com/736x/f4/5b/a2/f45ba230e75e78f3d0bc6fc014cfc974.jpg' },
    { id: 7, title: 'Cocktail Party', image: 'https://img.weddingbazaar.com/photos/pictures/001/902/150/new_medium/retro_luxe_2_-_atisuto.jpg?1598771250' },
    { id: 8, title: 'Welcome Dinner', image: 'https://img.freepik.com/free-photo/wedding-table-with-candles-decorated-with-bouquets-flowers_8353-9575.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 9, title: 'Farewell Brunch', image: 'https://www.peerspace.com/resources/wp-content/uploads/phoenix-Urban-Jungle-Space-1024x683.webp' },
    { id: 10, title: 'Photo Shoot', image: 'https://cdn.shopify.com/s/files/1/0632/2526/6422/files/vvohra87_Mirrors_can_be_amazing_add-ons_to_your_creative_photo__480x480_24a937b4-f9dc-4695-b159-5377812277ed.jpg?v=1736373064' },
    { id: 11, title: 'Music Night', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-eXeb76sVmdaJpFIgN2Slq-FmE3bIGgKJSA&s' },
    { id: 12, title: 'Bridal Shower', image: 'https://i.etsystatic.com/15245563/r/il/76ac6d/4012415903/il_570xN.4012415903_1pbx.jpg' }
];


const Events = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
            <Navbar />

            {/* Header section */}
            <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#F9F4E8' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: 'serif', color: '#111', marginBottom: '15px' }}>Events</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                    Explore and manage all wedding events. Each event can be customized with services and preferences.
                </p>
            </div>

            {/* Grid display */}
            <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '30px'
                }}>
                    {weddingEvents.map((event) => (
                        <div
                            key={event.id}
                            style={{
                                borderRadius: '15px',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                transition: 'transform 0.3s ease',
                                cursor: 'pointer',
                                border: '1px solid #eee'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => navigate('/dashboard', { state: { openService: 'Weddings' } })}
                        >
                            <img src={event.image} alt={event.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#333' }}>{event.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
                                    Customize this wedding event with your preferred services.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
