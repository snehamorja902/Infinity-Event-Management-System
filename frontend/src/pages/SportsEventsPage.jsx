import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const SportsEventsPage = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [regType, setRegType] = useState('team');
    const [isRegistered, setIsRegistered] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    // New state to track if there are any fixtures for the selected tournament
    const [hasFixtures, setHasFixtures] = useState(false);
    const [allFixtures, setAllFixtures] = useState([]);
    const [allRegistrations, setAllRegistrations] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', subMessage: '', type: '' });

    const [filterMode, setFilterMode] = useState('All');

    // Sport Rules for dynamic fields
    const sportConfigs = {
        'Cricket': { players: 11, subs: 3, price: 5000, isTeam: true },
        'Polo': { players: 4, subs: 2, price: 8000, isTeam: true },
        'Football': { players: 11, subs: 5, price: 4500, isTeam: true },
        'Volleyball': { players: 6, subs: 2, price: 3000, isTeam: true },
        'Kabaddi': { players: 7, subs: 5, price: 2500, isTeam: true },
        'Snookers': { players: 3, subs: 1, price: 2000, isTeam: true },
        'Archery': { players: 1, subs: 0, price: 1500, isTeam: false },
        'Boxing': { players: 1, subs: 0, price: 2000, isTeam: false },
        'Tennis': { players: 1, subs: 0, price: 3000, isTeam: false },
        'chess': { players: 1, subs: 0, price: 500, isTeam: false },
        'badminton': { players: 1, subs: 0, price: 800, isTeam: false },
        'tennis': { players: 1, subs: 0, price: 1000, isTeam: false },
        'Relay Race': { players: 2, subs: 1, price: 2000, isTeam: true }
    };

    const calculateDaysRemaining = (tourneyDate) => {
        const today = new Date();
        const start = new Date(tourneyDate);
        const diffTime = start - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredTournaments = tournaments.filter(t => {
        // Remove past tournaments
        const eventDate = new Date(t.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) return false;

        if (filterMode === 'All') return true;
        const config = sportConfigs[t.sport];
        if (!config) return true; // Default to show if unknown
        return filterMode === 'Team' ? config.isTeam : !config.isTeam;
    });

    const [formData, setFormData] = useState({
        teamName: '',
        captainName: '',
        players: [],
        substitutes: [],
        pName: '',
        pAge: '',
        contact: '',
        experienceLevel: 'None',
    });

    useEffect(() => {
        const pending = localStorage.getItem('pendingSportsReg');
        if (pending && !!localStorage.getItem('access_token')) {
            try {
                const data = JSON.parse(pending);
                setSelectedTournament(data.tournament);
                setFormData(data.formData);
                setRegType(data.regType);

                const autoAction = localStorage.getItem('pendingAutoAction');
                if (autoAction === 'open_payment') {
                    setShowPayment(true);
                    localStorage.removeItem('pendingAutoAction');
                }
                localStorage.removeItem('pendingSportsReg');
            } catch (e) {
                localStorage.removeItem('pendingSportsReg');
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchTournaments();
        fetchRegistrations();
        fetchFixtures();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/sports-registrations/');
            setAllRegistrations(res.data || []);
        } catch (e) { console.error("Failed to load regs"); }
    };

    const fetchFixtures = async () => {
        try {
            const res = await api.get('/fixtures/');
            setAllFixtures(res.data || []);
        } catch (e) { console.error("Failed to load fixtures"); }
    };

    // Check for fixtures from API data
    useEffect(() => {
        if (isRegistered && selectedTournament) {
            const exists = allFixtures.some(f => f.tournament === selectedTournament.id);
            setHasFixtures(exists);
        }
    }, [isRegistered, selectedTournament, allFixtures]);

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/tournaments/');
            setTournaments(res.data || []);
        } catch (err) {
            console.error("Failed to fetch tournaments");
        }
    };

    const handleSelectTourney = (t) => {
        // Winner / Completion Check Logic
        const tRegs = allRegistrations.filter(r => Number(r.tournament) === Number(t.id));
        const winnerObj = tRegs.find(r => r.status === 'Winner');
        const activeCount = tRegs.filter(r => r.status !== 'Eliminated' && r.status !== 'Cancelled').length;
        const tFix = allFixtures.filter(f => Number(f.tournament) === Number(t.id));

        const isDone = t.status === 'Completed' || winnerObj || (activeCount === 1 && tFix.length > 0);

        if (isDone) {
            const finalWinner = winnerObj || (activeCount === 1 ? tRegs.find(r => r.status !== 'Eliminated' && r.status !== 'Cancelled') : null);
            const winnerName = finalWinner ? (finalWinner.team_name || finalWinner.player_name || finalWinner.username) : 'TBD';

            // Show a professional notice
            setCustomAlert({
                show: true,
                title: 'CONCLUDED',
                message: `Champion: ${winnerName}`,
                subMessage: 'This tournament has finished. Registration is now closed.',
                type: 'CONCLUDED'
            });
            return;
        }

        // Deadline Check
        if (t.registration_deadline) {
            const deadlineDate = new Date(t.registration_deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);

            if (today > deadlineDate) {
                setCustomAlert({
                    show: true,
                    title: 'CLOSED',
                    message: `DEADLINE PASSED: ${t.registration_deadline}`,
                    subMessage: 'You can no longer register for this event.',
                    type: 'CLOSED'
                });
                return;
            }
        }

        setSelectedTournament(t);
        const config = sportConfigs[t.sport] || { players: 1, subs: 0, price: 1000, isTeam: false };
        const autoRegType = config.isTeam ? 'team' : 'participant';
        setRegType(autoRegType);

        setFormData({
            ...formData,
            players: Array(config.players).fill(''),
            substitutes: Array(config.subs).fill('')
        });
        window.scrollTo({ top: 600, behavior: 'smooth' });
    };

    const checkAuth = () => {
        return !!localStorage.getItem('access_token');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowPayment(true);
    };

    const completePayment = async () => {
        if (!checkAuth()) {
            setCustomAlert({
                show: true,
                title: 'AUTH REQUIRED',
                message: 'Please login to proceed.',
                subMessage: 'Secure access is required for tournament registration.',
                type: 'AUTH'
            });
            return;
        }

        const config = sportConfigs[selectedTournament.sport] || { price: 1000 };
        const registrationData = {
            tournament: selectedTournament.id,
            registration_type: regType === 'team' ? 'Team' : 'Individual',
            team_name: formData.teamName || null,
            captain_name: formData.captainName || null,
            player_name: formData.pName || null,
            players: formData.players,
            substitutes: formData.substitutes,
            price: config.price,
            status: 'Confirmed'
        };

        try {
            const res = await api.post('/sports-registrations/', registrationData);
            setIsRegistered(true);
            setShowPayment(false);
            setCustomAlert({
                show: true,
                title: 'SUCCESS',
                message: 'Registration Confirmed!',
                subMessage: 'See you on the field, Champion.',
                type: 'SUCCESS'
            });
        } catch (err) {
            setCustomAlert({
                show: true,
                title: 'ERROR',
                message: 'Registration Failed.',
                subMessage: err.response?.data?.message || 'Please check your connection and try again.',
                type: 'ERROR'
            });
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <Navbar />

            {/* HERO */}
            <header style={styles.hero}>
                <div style={styles.heroOverlay}>
                    <div style={styles.heroContent}>
                        <div style={styles.sportTag}>LIVE TOURNAMENTS</div>
                        <h1 style={styles.heroTitle}>Pro Series 2026</h1>
                        <p style={styles.heroSub}>Admin-managed professional championships. Register your squad for the upcoming majors.</p>
                    </div>
                </div>
            </header>

            <div style={styles.container}>

                {/* TOURNAMENT LIST - ADMIN CREATED */}
                {!isRegistered && (
                    <section style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={styles.sectionHeadingAlt}>Choose Your Championship</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['All', 'Team', 'Solo'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setFilterMode(mode)}
                                        style={filterMode === mode ? styles.toggleBtnActive : styles.toggleBtn}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                            {filteredTournaments.length > 0 ? filteredTournaments.map(t => {
                                const tRegs = allRegistrations.filter(r => Number(r.tournament) === Number(t.id));
                                const winner = tRegs.find(r => r.status === 'Winner');
                                const activeCount = tRegs.filter(r => r.status !== 'Eliminated' && r.status !== 'Cancelled').length;
                                const tFix = allFixtures.filter(f => Number(f.tournament) === Number(t.id));
                                const isDone = t.status === 'Completed' || winner || (activeCount === 1 && tFix.length > 0);
                                const finalWinner = winner || (activeCount === 1 ? tRegs.find(r => r.status !== 'Eliminated' && r.status !== 'Cancelled') : null);
                                const winnerName = finalWinner ? (finalWinner.team_name || finalWinner.player_name || finalWinner.username) : 'TBD';

                                return (
                                    <div key={t.id} style={selectedTournament?.id === t.id ? styles.tourneyCardActive : styles.tourneyCard} onClick={() => handleSelectTourney(t)}>
                                        <div style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', position: 'relative' }}>
                                            <img src={t.image || "https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg?semt=ais_hybrid&w=740&q=80"} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: sportConfigs[t.sport]?.isTeam ? '#1D3557' : '#E63946', color: '#fff', padding: '4px 12px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold' }}>
                                                {sportConfigs[t.sport]?.isTeam ? 'TEAM' : 'SOLO'}
                                            </div>
                                            {isDone && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, right: 0, bottom: 0,
                                                    background: 'rgba(0,0,0,0.4)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backdropFilter: 'blur(3px)',
                                                    zIndex: 2
                                                }}>
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                                        padding: '8px 20px',
                                                        borderRadius: '50px',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#1D3557', textTransform: 'uppercase', letterSpacing: '1px' }}>Tournament Winner</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1D3557' }}>🏆 {winnerName}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#E63946', letterSpacing: '1px' }}>{t.sport.toUpperCase()}</div>
                                        <h3 style={{ margin: '10px 0', fontSize: '1.4rem', color: '#111' }}>{t.name}</h3>
                                        <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                                            <span>📅 Event: {t.date}</span>
                                            {!isDone && (
                                                calculateDaysRemaining(t.date) > 0 ? (
                                                    <span style={{ color: '#E63946', fontWeight: 'bold' }}>⏳ {calculateDaysRemaining(t.date)} Days to go</span>
                                                ) : (
                                                    <span style={{ color: '#4B5563', fontWeight: 'bold' }}>🏁 Started</span>
                                                )
                                            )}
                                        </div>

                                        {t.registration_deadline && !isDone && (
                                            <div style={{
                                                marginBottom: '15px',
                                                background: '#FFFBEB',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                color: '#92400E',
                                                border: '1px solid #FEF3C7',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <span style={{ fontSize: '1rem' }}>📝</span>
                                                <div>
                                                    <strong>Registration Deadline:</strong> {t.registration_deadline}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem', fontWeight: '800', color: '#10B981' }}>● {t.status}</div>
                                    </div>
                                );
                            }) : (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px 40px', background: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏆</div>
                                    <h3 style={{ color: '#1D3557', marginBottom: '10px' }}>No {filterMode} Tournaments Live</h3>
                                    <p style={{ color: '#888' }}>Check back later or contact admin to register a new {filterMode.toLowerCase()} event.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* DYNAMIC REGISTRATION FORM */}
                {selectedTournament && !isRegistered && (
                    <section style={styles.regSection}>
                        <h2 style={styles.sectionHeadingAlt}>Register for {selectedTournament.name}</h2>
                        <div style={{ textAlign: 'center', marginBottom: '30px', padding: '15px', background: sportConfigs[selectedTournament.sport]?.isTeam ? '#1D355710' : '#E6394610', borderRadius: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: sportConfigs[selectedTournament.sport]?.isTeam ? '#1D3557' : '#E63946' }}>
                                {sportConfigs[selectedTournament.sport]?.isTeam ? '👥 TEAM REGISTRATION' : '🏃 SOLO REGISTRATION'}
                            </span>
                        </div>
                        <form onSubmit={handleFormSubmit} style={styles.regCard}>

                            {regType === 'team' ? (
                                <>
                                    <div style={styles.row}>
                                        <div style={styles.inputGroup}><label style={styles.label}>Team Name</label><input style={styles.input} required value={formData.teamName} onChange={e => setFormData({ ...formData, teamName: e.target.value })} /></div>
                                        <div style={styles.inputGroup}><label style={styles.label}>Captain Name</label><input style={styles.input} required value={formData.captainName} onChange={e => setFormData({ ...formData, captainName: e.target.value })} /></div>
                                    </div>
                                    <h3 style={styles.subHeading}>Active Squad ({formData.players.length} Players)</h3>
                                    <div style={styles.squadGrid}>
                                        {formData.players.map((p, i) => <input key={i} style={styles.input} placeholder={`Player ${i + 1}`} required onChange={e => {
                                            const np = [...formData.players]; np[i] = e.target.value; setFormData({ ...formData, players: np });
                                        }} />)}
                                    </div>
                                </>
                            ) : (
                                <div style={styles.row}>
                                    <div style={styles.inputGroup}><label style={styles.label}>Full Name</label><input style={styles.input} required value={formData.pName} onChange={e => setFormData({ ...formData, pName: e.target.value })} /></div>
                                    <div style={styles.inputGroup}><label style={styles.label}>Age</label><input style={styles.input} type="number" required /></div>
                                </div>
                            )}

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Pro Level</label>
                                    <select style={styles.select} value={formData.experienceLevel} onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}>
                                        <option>None</option><option>District</option><option>State</option><option>National</option><option>International</option>
                                    </select>
                                </div>
                                <div style={styles.inputGroup}><label style={styles.label}>Contact</label><input style={styles.input} required /></div>
                            </div>

                            <button type="submit" style={styles.submitBtn}>JOIN TOURNAMENT (Pay ₹{sportConfigs[selectedTournament.sport]?.price || 1000})</button>
                        </form>
                    </section>
                )}

                {/* PAYMENT GATEWAY & LOGIN CHECK */}
                {showPayment && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.paymentCard}>
                            {!checkAuth() ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
                                    <h2 style={{ color: '#1D3557', marginBottom: '10px' }}>Authentication Required</h2>
                                    <p style={{ color: '#666', marginBottom: '30px' }}>To secure your spot and process the payment, please log in to your account or create a new one.</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <button
                                            onClick={() => {
                                                const saveState = { tournament: selectedTournament, formData, regType };
                                                localStorage.setItem('pendingSportsReg', JSON.stringify(saveState));
                                                localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/sports' }));
                                                localStorage.setItem('pendingAutoAction', 'open_payment');
                                                navigate('/login');
                                            }}
                                            style={{ ...styles.confirmBtn, background: '#1D3557' }}
                                        >
                                            Login to Proceed
                                        </button>
                                        <button
                                            onClick={() => {
                                                const saveState = { tournament: selectedTournament, formData, regType };
                                                localStorage.setItem('pendingSportsReg', JSON.stringify(saveState));
                                                localStorage.setItem('pendingNavigation', JSON.stringify({ to: '/sports' }));
                                                localStorage.setItem('pendingAutoAction', 'open_payment');
                                                navigate('/register');
                                            }}
                                            style={{ ...styles.confirmBtn, background: '#E63946' }}
                                        >
                                            Sign Up Now
                                        </button>
                                        <button
                                            onClick={() => setShowPayment(false)}
                                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', marginTop: '10px' }}
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2>Verified Payment Gate</h2>
                                    <div style={styles.paymentGrid}>
                                        <div style={{ textAlign: 'center' }}>
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay_tournament_${selectedTournament.id}`} alt="QR" />
                                            <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Scan & Pay via UPI</p>
                                        </div>
                                        <div>
                                            <p><strong>Tournament:</strong> {selectedTournament.name}</p>
                                            <p><strong>Total:</strong> ₹{sportConfigs[selectedTournament.sport]?.price}</p>
                                            <button onClick={completePayment} style={styles.confirmBtn}>I HAVE PAID</button>
                                            <button onClick={() => setShowPayment(false)} style={{ ...styles.confirmBtn, background: '#eee', color: '#111', marginTop: '10px' }}>CANCEL</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* DASHBOARD AFTER REGISTRATION */}
                {isRegistered && (
                    <div style={{ marginTop: '40px' }}>
                        <div style={{ padding: '50px', background: '#1D3557', borderRadius: '30px', color: '#fff', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '2.5rem' }}>Welcome to {selectedTournament.name}!</h2>
                            <p>You are officially registered. The Admin is now setting up the bracket.</p>
                            {hasFixtures ? (
                                <button onClick={() => navigate('/my-bookings', { state: { tab: 'Sports' } })} style={{ marginTop: '20px', padding: '12px 30px', background: '#E63946', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>View Live Fixtures</button>
                            ) : (
                                <p style={{ marginTop: '20px', fontStyle: 'italic' }}>Fixtures will be added by the admin shortly.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

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

const styles = {
    pageWrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" },
    hero: { height: '50vh', backgroundImage: 'url("https://img.freepik.com/free-vector/sport-equipment-concept_1284-13034.jpg?semt=ais_hybrid&w=740&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' },
    heroOverlay: { height: '100%', width: '100%', background: 'linear-gradient(rgba(29, 53, 87, 0.9), rgba(29, 53, 87, 0.7))', display: 'flex', alignItems: 'center', padding: '0 10%' },
    heroContent: { color: '#fff', maxWidth: '700px' },
    sportTag: { background: '#E63946', display: 'inline-block', padding: '6px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px' },
    heroTitle: { fontSize: '4rem', margin: '0 0 20px 0', textTransform: 'uppercase', fontWeight: '900' },
    heroSub: { fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
    sectionHeadingAlt: { fontSize: '2rem', color: '#1D3557', marginBottom: '30px', fontWeight: '900' },
    tourneyCard: { position: 'relative', background: '#fff', padding: '30px', borderRadius: '20px', cursor: 'pointer', transition: '0.3s', border: '2px solid transparent', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', overflow: 'hidden' },
    tourneyCardActive: { position: 'relative', background: '#fff', padding: '30px', borderRadius: '20px', cursor: 'pointer', border: '2px solid #E63946', boxShadow: '0 10px 30px rgba(230, 57, 70, 0.2)', overflow: 'hidden' },
    regSection: { background: '#fff', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' },
    regCard: { maxWidth: '800px', margin: '0 auto' },
    regToggleContainer: { display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' },
    toggleBtn: { padding: '12px 40px', borderRadius: '50px', border: '2px solid #eee', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#888' },
    toggleBtnActive: { padding: '12px 40px', borderRadius: '50px', border: '2px solid #E63946', background: '#E63946', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
    row: { display: 'flex', gap: '20px', marginBottom: '25px' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#1D3557' },
    input: { padding: '15px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '1rem', outline: 'none' },
    select: { padding: '15px', border: '1px solid #ddd', borderRadius: '10px', background: '#fff', fontSize: '1rem' },
    subHeading: { fontSize: '1.2rem', color: '#1D3557', margin: '30px 0 20px 0', fontWeight: 'bold' },
    squadGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' },
    submitBtn: { width: '100%', padding: '22px', background: '#1D3557', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', marginTop: '40px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    paymentCard: { background: '#fff', padding: '40px', borderRadius: '25px', maxWidth: '500px', width: '90%' },
    paymentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' },
    confirmBtn: { width: '100%', padding: '15px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default SportsEventsPage;
