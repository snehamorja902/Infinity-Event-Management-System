import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/dashboard');
    }

    const [latestBlogs, setLatestBlogs] = useState([]);
    const [winners, setWinners] = useState([]);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await API.get('/blogs/');
                setLatestBlogs(res.data.filter(b => b.is_published).slice(0, 3));

                const sportsRes = await API.get('/sports-registrations/');
                setWinners(sportsRes.data.filter(r => r.status === 'Winner').slice(0, 4));
            } catch (err) {
                console.error("Home data fetch error", err);
            }
        };
        fetchLatest();
    }, []);

    const categories = [
        {
            id: 1,
            title: "Destination Weddings",
            image: "/cat_dest_wedding.png",
            description: "Experience the magic of love in breathtaking locations."
        },
        {
            id: 7,
            title: "Elite Sports",
            image: "https://i.pinimg.com/736x/c7/45/16/c74516012a503eb72f3df428e15e6467.jpg",
            description: "Professionally managed tournaments and endurance races."
        },
        {
            id: 3,
            title: "Performers",
            image: "/cat_performers.png",
            description: "Top-tier singers, bands, and entertainers for your event."
        },
        {
            id: 4,
            title: "Exquisite Catering",
            image: "/cat_catering.png",
            description: "Gourmet dining experiences tailored to your taste."
        },
        {
            id: 5,
            title: "Luxury Venues",
            image: "/hero_bg.png",
            description: "Access to the most exclusive ballrooms and halls."
        },
        {
            id: 6,
            title: "Decor & Styling",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
            description: "Transforming spaces with elegant floral and design."
        }
    ];

    return (
        <div>
            <Navbar />

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                height: '80vh',
                minHeight: '600px',
                backgroundImage: 'url(/hero_bg.png)',
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
                    backgroundColor: 'rgba(0,0,0,0.3)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', padding: '0 20px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '80px', marginBottom: '20px', filter: 'invert(1) brightness(100)' }} />
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '5px' }}>Infinity</h1>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '40px', fontWeight: '400', letterSpacing: '4px', textTransform: 'uppercase' }}>Hospitality</h2>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button className="btn-primary" onClick={handleClick}>Explore</button>
                        <button className="btn-primary" style={{ backgroundColor: 'transparent', border: '2px solid #fff', color: '#fff' }} onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Contact Us</button>
                    </div>
                </div>
            </header>

            {/* Categories Section */}
            <div className="container" style={{ padding: '80px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Our Services</h2>
                    <p style={{ color: '#777', maxWidth: '600px', margin: '0 auto' }}>Curated experiences for every occasion.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                    {categories.map(cat => (
                        <div key={cat.id} onClick={handleClick} style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                            <div style={{ height: '250px', overflow: 'hidden', borderRadius: '5px 5px 0 0' }}>
                                <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '0 0 5px 5px', textAlign: 'center', minHeight: '160px' }}>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>{cat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {winners.length > 0 && (
                <div style={{ backgroundColor: '#0f172a', padding: '100px 20px', color: '#fff' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <span style={{ color: '#F59E0B', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>🏆 Hall of Fame</span>
                            <h2 style={{ fontSize: '3rem', marginTop: '10px', marginBottom: '20px', fontFamily: 'serif' }}>Recent Champions</h2>
                            <div style={{ width: '60px', height: '3px', backgroundColor: '#F59E0B', margin: '0 auto' }}></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            {winners.map(w => (
                                <div key={w.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center', transition: '0.3s' }}>
                                    <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🥇</div>
                                    <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px', fontWeight: '800' }}>{w.team_name || w.player_name || w.username}</h3>
                                    <p style={{ color: '#F59E0B', fontSize: '1rem', fontWeight: '700', marginBottom: '25px', letterSpacing: '1px' }}>{w.tournament_name}</p>
                                    <div style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 20px rgba(217,119,6,0.2)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Total Settlement Won</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>₹{(parseFloat(w.price || 0) + parseFloat(w.winning_amount || 0)).toLocaleString()}</div>
                                    </div>
                                    <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#718096', fontWeight: '600' }}>{w.sport} Category</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Latest Stories Section */}
            <div style={{ backgroundColor: '#fcfcfc', padding: '100px 0' }}>
                <div className="container" style={{ padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                        <div>
                            <h2 style={{ fontSize: '3rem', marginBottom: '15px', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>Latest Stories</h2>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Discover news and insights from our experts.</p>
                        </div>
                        <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', color: '#c5a059', fontWeight: '700', cursor: 'pointer', borderBottom: '2px solid' }}>VIEW ALL ARTICLES &rarr;</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {latestBlogs.map(post => (
                            <div key={post.id} onClick={() => navigate(`/blog/${post.id}`)} style={{ cursor: 'pointer', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', transition: 'transform 0.3s', textAlign: 'center' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ height: '260px', overflow: 'hidden' }}>
                                    <img src={post.image || 'https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=800'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '35px 25px' }}>
                                    <h3 style={{
                                        fontSize: '1.4rem',
                                        margin: '0 0 15px 0',
                                        lineHeight: '1.3',
                                        fontFamily: "'Playfair Display', serif",
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        fontWeight: '700',
                                        color: '#1a1a1a'
                                    }}>
                                        {post.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#666',
                                        lineHeight: '1.6',
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        {post.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                                    </p>
                                    <div style={{ width: '30px', height: '2px', backgroundColor: '#C4A059', margin: '20px auto 0' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div id="contact" style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', marginBottom: '40px', color: '#c5a059' }}>Contact Us</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
                        <div style={{ maxWidth: '300px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Visit Us</h4>
                            <p style={{ color: '#ccc' }}>123 Luxury Avenue,<br />Beverly Hills,Surat</p>
                        </div>
                        <div style={{ maxWidth: '300px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Get in Touch</h4>
                            <p style={{ color: '#ccc' }}>
                                Phone: +91 84697 45000<br />
                                Email: info@infinityhospitality.com
                            </p>
                        </div>
                        <div style={{ maxWidth: '300px' }}>
                            <h4 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Hours</h4>
                            <p style={{ color: '#ccc' }}>Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: By Appointment</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '50px', fontSize: '0.8rem', color: '#555' }}>
                        &copy; 2025 Infinity Hospitality. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
