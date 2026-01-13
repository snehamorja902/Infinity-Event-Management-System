import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Blog = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await api.get('/blogs/');
                // Only show published blogs to users
                setBlogs(res.data.filter(b => b.is_published));
            } catch (err) {
                console.error("Failed to fetch blogs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                height: '50vh',
                backgroundImage: 'url("https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=2000")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
                <div style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", margin: 0, letterSpacing: '-2px' }}>The Journal</h1>
                    <div style={{ width: '80px', height: '3px', backgroundColor: '#C4A059', margin: '30px auto' }}></div>
                    <p style={{ fontSize: '1.4rem', fontWeight: '300', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>Insights, Stories & Event Inspiration</p>
                </div>
            </header>

            {/* Blog Grid */}
            <div className="container" style={{ padding: '100px 20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>Curating the journal for you...</div>
                ) : blogs.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '50px'
                    }}>
                        {blogs.map(post => (
                            <div key={post.id}
                                onClick={() => navigate(`/blog/${post.id}`)}
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ height: '300px', overflow: 'hidden' }}>
                                    <img src={post.image || 'https://images.unsplash.com/photo-1455390582262-044cdead2777a?auto=format&fit=crop&q=80&w=800'} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '40px 30px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h2 style={{
                                        fontSize: '1.6rem',
                                        margin: '0 0 20px 0',
                                        fontFamily: "'Playfair Display', serif",
                                        lineHeight: '1.2',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        color: '#1a1a1a',
                                        fontWeight: '700'
                                    }}>
                                        {post.title}
                                    </h2>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '1.05rem',
                                        lineHeight: '1.7',
                                        margin: '0 auto 25px auto',
                                        maxWidth: '90%',
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: '400'
                                    }}>
                                        {post.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                    </p>
                                    <div style={{ width: '40px', height: '2.5px', backgroundColor: '#C4A059', margin: '0 auto' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                        <h2 style={{ fontFamily: 'serif', color: '#333' }}>No Stories Found</h2>
                        <p style={{ color: '#888' }}>Our curators are working on new insights. Check back soon!</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={{ padding: '80px 20px', backgroundColor: 'var(--color-dark)', color: '#fff', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '20px' }}>Infinity Hospitality</h3>
                <p style={{ opacity: 0.6 }}>&copy; 2025 All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Blog;
