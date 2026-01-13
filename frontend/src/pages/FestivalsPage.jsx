import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert';
import {
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    MusicalNoteIcon,
    TicketIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const FestivalsPage = () => {
    const navigate = useNavigate();
    const [festivalList, setFestivalList] = useState([]);
    const [selectedFestival, setSelectedFestival] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'details'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFestivals();
    }, []);

    const fetchFestivals = async () => {
        try {
            const res = await API.get('/festivals/');
            setFestivalList(res.data);
        } catch (error) {
            console.error("Failed to load festivals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFestivalSelect = (fest) => {
        setSelectedFestival(fest);
        setView('details');
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        const pending = localStorage.getItem('pendingFestivalReg');
        if (pending && !!localStorage.getItem('access_token')) {
            try {
                const data = JSON.parse(pending);
                setSelectedFestival(data.festival);
                window.pendingFestivalData = data;
                setView('details');
                localStorage.removeItem('pendingFestivalReg');
            } catch (e) {
                localStorage.removeItem('pendingFestivalReg');
            }
        }
    }, []);

    if (view === 'details' && selectedFestival) {
        return <FestivalDetailView festival={selectedFestival} onBack={() => { setView('list'); window.scrollTo(0, 0); }} />;
    }

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
            <Navbar />

            {/* Festival Hero */}
            <header style={heroStyles}>
                <div style={heroOverlayStyles}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
                        <span style={heroTagline}>CELEBRATE TRADITION</span>
                        <h1 style={heroTitle}>Grand Indian Festivals</h1>
                        <p style={heroSub}>Experience the vibrance, culture, and energy of India's biggest celebrations.</p>
                    </div>
                </div>
            </header>

            {/* Festival Grid */}
            <main style={{ maxWidth: '1300px', margin: '60px auto', padding: '0 20px' }}>
                {loading ? (
                    <div style={{ padding: '100px', textAlign: 'center', fontSize: '1.2rem', color: '#888' }}>Discovering vibrant celebrations...</div>
                ) : festivalList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#888' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif' }}>No Upcoming Festivals</h2>
                        <p>We're brewing some cultural magic. Check back soon!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                        {festivalList.map(fest => (
                            <div key={fest.id} style={cardStyles} onClick={() => handleFestivalSelect(fest)}>
                                <div style={{ position: 'relative', overflow: 'hidden', height: '240px' }}>
                                    <ImageWithFallback src={fest.image} alt={fest.name} style={cardImgStyles} />
                                    <div style={cardBadge}><CalendarIcon style={{ width: '14px', marginRight: '5px' }} />{fest.startDate}</div>
                                </div>
                                <div style={{ padding: '30px' }}>
                                    <h3 style={{ fontSize: '1.9rem', fontWeight: '900', color: fest.color.replace('0.9', '1'), marginBottom: '10px', fontFamily: 'Playfair Display, serif' }}>{fest.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', marginBottom: '25px', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <MapPinIcon style={{ width: '18px', color: fest.color }} /> {fest.venue}, {fest.city}
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {fest.highlights.slice(0, 3).map((h, i) => (
                                            <div key={i} style={{ ...miniTag, background: `${fest.color}10`, color: fest.color, borderColor: `${fest.color}20`, fontSize: '0.85rem' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{h.icon}</span> {h.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Starts At</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1a1a1a' }}>₹{fest.passes?.[0]?.price || 0}</div>
                                        </div>
                                        <button style={{ background: fest.color, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem' }}>EXPLORE</button>
                                    </div>
                                    <button style={{ ...viewBtn, background: fest.color, boxShadow: `0 8px 18px ${fest.color}30`, fontSize: '1.1rem', marginTop: '15px' }}>
                                        Plan Festival →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const FestivalDetailView = ({ festival, onBack }) => {
    const navigate = useNavigate();
    const [bookingModal, setBookingModal] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedPass, setSelectedPass] = useState(() => {
        if (window.pendingFestivalData?.selectedPass) {
            return window.pendingFestivalData.selectedPass;
        }
        return null;
    });
    const [qty, setQty] = useState(() => {
        if (window.pendingFestivalData?.qty) {
            return window.pendingFestivalData.qty;
        }
        return 1;
    });
    const [isBooking, setIsBooking] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', subMessage: '' });

    useEffect(() => {
        const autoAction = localStorage.getItem('pendingAutoAction');
        if (autoAction === 'open_payment' || window.pendingFestivalData) {
            setShowPayment(true);
            localStorage.removeItem('pendingAutoAction');
            delete window.pendingFestivalData;
        }
    }, []);

    const checkDeadline = () => {
        if (!festival.booking_deadline) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(festival.booking_deadline);
        return today > deadline;
    };

    const handleBook = (pass) => {
        if (checkDeadline()) {
            setCustomAlert({ show: true, title: 'OOPS!', message: 'You missed the event, all tickets booked.' });
            return;
        }
        setSelectedPass(pass);
        setBookingModal(true);
    };

    const confirmToPayment = () => {
        setBookingModal(false);
        setShowPayment(true);
    };

    const checkAuth = () => {
        return !!localStorage.getItem('access_token');
    };

    const finalizePayment = async () => {
        if (!checkAuth()) {
            setCustomAlert({
                show: true,
                title: 'AUTH REQUIRED',
                message: "Please login to proceed with booking."
            });
            return;
        }

        setIsBooking(true);
        try {
            await API.post('festival-bookings/create/', {
                festival_name: festival.name,
                pass_type: selectedPass.type,
                quantity: qty,
                total_price: selectedPass.price * qty
            });
            setCustomAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Booking Confirmed!',
                subMessage: "Your festival passes are secured. Check 'My Bookings' for details."
            });
            setTimeout(() => window.location.reload(), 3000);
        } catch (err) {
            console.error(err);
            setCustomAlert({
                show: true,
                title: 'FAILED',
                message: 'Payment Failed',
                subMessage: 'Technical glitch. Please check your network and try again.'
            });
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
            <Navbar />

            {/* Hero Section - Matching User Image exactly */}
            <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#000' }}>
                <ImageWithFallback src={festival.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.8' }} />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to top, ${festival.color} 5%, rgba(0,0,0,0.2) 60%, transparent 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 8%'
                }}>
                    <div style={{ maxWidth: '1400px', width: '100%' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '60px' }}>
                            <button onClick={onBack} style={{
                                background: festival.color,
                                border: '1px solid rgba(255,255,255,0.4)',
                                padding: '12px 28px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '800',
                                color: '#fff',
                                cursor: 'pointer',
                                letterSpacing: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                ← GO BACK
                            </button>
                            <span style={{
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                color: festival.secondary,
                                letterSpacing: '10px',
                                textTransform: 'uppercase',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                                CELEBRATE THE MOMENT
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: '10rem',
                            fontWeight: '500',
                            color: '#fff',
                            fontFamily: 'Playfair Display, serif',
                            marginBottom: '60px',
                            lineHeight: '0.9',
                            textShadow: '0 30px 100px rgba(0,0,0,0.6)',
                            maxWidth: '1300px'
                        }}>{festival.name}</h1>

                        <div style={{ display: 'flex', gap: '60px', color: '#fff', fontSize: '1.4rem', fontWeight: '500', opacity: '0.95' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <CalendarIcon style={{ width: '32px', color: festival.secondary }} />
                                <span>{festival.startDate} - {festival.endDate}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <MapPinIcon style={{ width: '32px', color: festival.secondary }} />
                                <span>{festival.venue}, {festival.city}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Highlights Strip */}
            <div style={{ background: '#111', padding: '50px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '30px' }}>
                    {festival.highlights.map((h, i) => (
                        <div key={i} style={{ textAlign: 'center', borderRight: i < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                            <div style={{ fontSize: '2.8rem', marginBottom: '15px' }}>{h.icon}</div>
                            <div style={{ fontWeight: '900', color: festival.secondary, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{h.label}</div>
                            <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px' }}>{h.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '120px auto', display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '100px', padding: '0 20px' }}>

                {/* Left Content */}
                <div>
                    {/* About */}
                    <section style={{ marginBottom: '100px' }}>
                        <h2 style={{ ...sectionTitle, borderLeftColor: festival.color }}>Soul of the Festival</h2>
                        <p style={{ fontSize: '1.4rem', lineHeight: '2', color: '#2c2c2c', fontWeight: '300' }}>{festival.about}</p>
                    </section>

                    {/* Attractions */}
                    <section style={{ marginBottom: '100px' }}>
                        <h2 style={{ ...sectionTitle, borderLeftColor: festival.color }}>Signature Experiences</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
                            {festival.attractions?.map((a, i) => (
                                <div key={i} style={attractionCard}>
                                    <div style={{ fontSize: '3.5rem', marginBottom: '25px' }}>✨</div>
                                    <h4 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>{a.name || a.title}</h4>
                                    <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: '1.8' }}>{a.description || a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Schedule */}
                    <section style={{ marginBottom: '100px' }}>
                        <h2 style={{ ...sectionTitle, borderLeftColor: festival.color }}>Celebration Program</h2>
                        <div style={{ background: '#fdfdfd', borderRadius: '40px', padding: '60px', border: '1px solid #f0f0f0', boxShadow: '0 15px 50px rgba(0,0,0,0.02)' }}>
                            {festival.schedule?.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '60px', padding: '30px 0', borderBottom: i < festival.schedule.length - 1 ? '1px solid #eee' : 'none' }}>
                                    <div style={{ fontWeight: '900', color: festival.color, minWidth: '120px', fontSize: '1.2rem' }}>{s.time || s.day}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                        <SparklesIcon style={{ width: '24px', color: festival.secondary }} />
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111' }}>{s.event}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rules */}
                    <section style={{ marginBottom: '100px' }}>
                        <h2 style={{ ...sectionTitle, borderLeftColor: festival.color }}>Rules & Guidelines</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {festival.rules.map((r, i) => (
                                <div key={i} style={{ display: 'flex', gap: '15px', color: '#444', fontSize: '1rem', background: '#f9f9f9', padding: '20px', borderRadius: '15px' }}>
                                    <ShieldCheckIcon style={{ width: '22px', color: '#10B981', flexShrink: 0 }} />
                                    {r}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar - Passes */}
                <div>
                    <div style={{ position: 'sticky', top: '140px' }}>
                        <div style={{ background: '#fff', padding: '50px', borderRadius: '40px', boxShadow: '0 40px 80px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#111', marginBottom: '40px', fontFamily: 'Playfair Display, serif' }}>Reserve Your Pass</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                {festival.passes.map((p, i) => (
                                    <div key={i} style={{ ...passCard, borderColor: selectedPass?.type === p.type ? festival.color : '#f0f0f0', background: selectedPass?.type === p.type ? `${festival.color}05` : '#fff' }} onClick={() => setSelectedPass(p)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111' }}>{p.type}</h4>
                                                <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '5px' }}>{p.days}</div>
                                            </div>
                                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: festival.color }}>₹{p.price}</div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '25px', lineHeight: '1.6', background: '#f9f9f9', padding: '15px', borderRadius: '12px' }}>
                                            ✦ {p.benefits}
                                        </div>
                                        <button
                                            style={{
                                                ...bookNowBtn,
                                                background: selectedPass?.type === p.type ? festival.color : '#111',
                                                transform: selectedPass?.type === p.type ? 'scale(1.03)' : 'scale(1)'
                                            }}
                                            onClick={(e) => { e.stopPropagation(); handleBook(p); }}>
                                            Book Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Confirm Modal */}
            {bookingModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: festival.color, marginBottom: '30px', fontFamily: 'Playfair Display, serif' }}>Confirm Selection</h2>
                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '25px', marginBottom: '25px' }}>
                            <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Event</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111' }}>{festival.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Pass Type</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111' }}>{selectedPass?.type}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Rate</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111' }}>₹{selectedPass?.price}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111' }}>Quantity</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtn}>-</button>
                                    <span style={{ fontSize: '1.4rem', fontWeight: '900' }}>{qty}</span>
                                    <button onClick={() => setQty(qty + 1)} style={qtyBtn}>+</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '25px', borderRadius: '20px', marginBottom: '35px' }}>
                            <span style={{ fontWeight: 'bold', color: festival.color, fontSize: '1.1rem' }}>Total Amount</span>
                            <span style={{ fontSize: '2rem', fontWeight: '900', color: '#111' }}>₹{selectedPass?.price * qty}</span>
                        </div>

                        <button
                            onClick={confirmToPayment}
                            style={{ ...bookNowBtn, background: festival.color, fontSize: '1.1rem', padding: '20px', borderRadius: '15px' }}>
                            Proceed to Payment
                        </button>
                        <button onClick={() => setBookingModal(false)} style={{ background: 'none', border: 'none', color: '#888', marginTop: '20px', cursor: 'pointer', width: '100%', fontWeight: '600' }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Payment Modal with Auth Gate */}
            {showPayment && (
                <div style={modalOverlay}>
                    <div style={{ ...modalContent, textAlign: 'center' }}>
                        {!checkAuth() ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '25px' }}>🔐</div>
                                <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: festival.color, marginBottom: '15px' }}>Authentication Required</h2>
                                <p style={{ color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>Please login or create an account to secure your festival passes and complete the payment process.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <button
                                        onClick={() => {
                                            const saveState = { festival, selectedPass, qty };
                                            localStorage.setItem('pendingFestivalReg', JSON.stringify(saveState));
                                            localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/festivals' }));
                                            localStorage.setItem('pendingAutoAction', 'open_payment');
                                            navigate('/login');
                                        }}
                                        style={{ ...bookNowBtn, background: festival.color }}
                                    >
                                        Login to Continue
                                    </button>
                                    <button
                                        onClick={() => {
                                            const saveState = { festival, selectedPass, qty };
                                            localStorage.setItem('pendingFestivalReg', JSON.stringify(saveState));
                                            localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/festivals' }));
                                            navigate('/register');
                                        }}
                                        style={{ ...bookNowBtn, background: '#111', color: '#fff' }}
                                    >
                                        Create New Account
                                    </button>
                                    <button
                                        onClick={() => setShowPayment(false)}
                                        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: '#C4A059', marginBottom: '10px' }}>Payment Gateway</h2>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>Secure UPI Checkout</div>

                                <div style={{ background: '#f9f9f9', border: '1px solid #f0f0f0', borderRadius: '24px', padding: '30px', textAlign: 'center', marginBottom: '30px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'bold', marginBottom: '15px' }}>SCAN QR TO PAY</div>
                                        <div style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=eventadmin@upi&pn=ImperialEvents&am=${selectedPass?.price * qty}&cu=INR`}
                                                alt="QR Code"
                                                style={{ width: '150px', height: '150px' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '20px 0' }}>
                                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                                        <span style={{ fontSize: '0.7rem', color: '#ccc', fontWeight: 'bold' }}>OR USE UPI ID</span>
                                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                                    </div>

                                    <div style={{ textAlign: 'left' }}>
                                        <label style={{ display: 'block', fontSize: '10px', color: '#aaa', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>ENTER YOUR UPI ID</label>
                                        <input
                                            type="text"
                                            placeholder="username@bank"
                                            style={{ width: '100%', padding: '18px', border: 'none', borderRadius: '12px', background: '#EEF2FF', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </div>

                                <button onClick={finalizePayment} disabled={isBooking} style={{ ...bookNowBtn, background: '#C4A059', color: '#000', padding: '22px' }}>
                                    {isBooking ? 'Verifying...' : `VERIFY & PAY ₹${(selectedPass?.price * qty).toLocaleString()}`}
                                </button>

                                <button onClick={() => setShowPayment(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                                    Go Back
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
                subMessage={customAlert.subMessage}
            />
        </div>
    );
};

// Styles
// Styles
const heroStyles = {
    height: '65vh',
    backgroundImage: 'url("https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1470&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'relative'
};

const heroOverlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    backdropFilter: 'blur(2px)'
};

const heroTitle = {
    fontSize: '6.5rem',
    fontWeight: '900',
    fontFamily: 'Playfair Display, serif',
    textShadow: '0 20px 50px rgba(0,0,0,0.5)',
    margin: '10px 0',
    letterSpacing: '-2px'
};

const heroTagline = {
    fontSize: '1.1rem',
    letterSpacing: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#FFD700',
    marginBottom: '10px'
};

const heroSub = {
    fontSize: '1.4rem',
    maxWidth: '800px',
    margin: '0 auto',
    opacity: '0.9',
    fontWeight: '300',
    lineHeight: '1.6'
};

const cardStyles = {
    background: '#fff',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    border: '1px solid #f0f0f0'
};

const viewBtn = {
    width: '100%',
    padding: '15px',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    fontWeight: '900',
    fontSize: '1rem',
    marginTop: '25px',
    cursor: 'pointer',
    transition: '0.4s',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const cardImgStyles = { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' };
const cardBadge = { position: 'absolute', top: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.95)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const miniTag = { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', border: '1px solid transparent' };

const ImageWithFallback = ({ src, style, alt }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    return (
        <img
            src={imgSrc}
            alt={alt}
            style={style}
            onError={() => setImgSrc("https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2070&auto=format&fit=crop")}
        />
    );
};

const sectionTitle = {
    fontSize: '2.8rem',
    fontWeight: '900',
    color: '#111',
    marginBottom: '45px',
    fontFamily: 'Playfair Display, serif',
    borderLeft: '12px solid',
    paddingLeft: '30px',
    lineHeight: '1.1'
};

const attractionCard = {
    background: '#fff',
    padding: '45px',
    borderRadius: '35px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 15px 40px rgba(0,0,0,0.02)',
    transition: '0.4s'
};

const passCard = {
    background: '#fff',
    padding: '35px',
    borderRadius: '30px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    transition: '0.4s',
    cursor: 'pointer'
};

const bookNowBtn = {
    width: '100%',
    padding: '18px',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    fontWeight: '900',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: '0.4s'
};

const backBtn = {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 25px',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '800',
    marginBottom: '40px',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: '0.3s'
};

const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
    padding: '20px'
};

const modalContent = {
    background: '#fff',
    width: '100%',
    maxWidth: '550px',
    padding: '60px',
    borderRadius: '45px',
    position: 'relative',
    boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
};

const qtyBtn = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #eee',
    background: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export default FestivalsPage;
