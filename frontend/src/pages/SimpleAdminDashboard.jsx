import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const sportsOptions = {
    Team: ['Cricket', 'Football', 'Volleyball', 'Kabaddi', 'Basketball', 'Hockey', 'Relay Race'],
    Solo: ['Running (100m)', 'Badminton', 'Chess', 'Table Tennis', 'Swimming', 'Cycling', 'Ludo', 'Carrom', 'Skating']
};

const BillRow = ({ label, value, sub, bold, big, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <div>
            <div style={{ fontSize: '0.9rem', fontWeight: bold ? '800' : '500', color: color || '#555' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#999' }}>{sub}</div>}
        </div>
        <div style={{ fontSize: big ? '1.1rem' : '0.9rem', fontWeight: bold ? '900' : '600', color: color || '#1a1a1a' }}>
            {value === '-' ? '-' : `₹${(parseFloat(value) || 0).toLocaleString()}`}
        </div>
    </div>
);

const SimpleAdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [concertBookings, setConcertBookings] = useState([]);
    const [festivalBookings, setFestivalBookings] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [jobApplications, setJobApplications] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);

    const [activeTab, setActiveTab] = useState('Weddings');
    const [viewTournaments, setViewTournaments] = useState(false);
    const [showCreateBlog, setShowCreateBlog] = useState(false);
    const [blogForm, setBlogForm] = useState({ title: '', content: '', image: '', author: 'Admin' });
    const [editingBlog, setEditingBlog] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [inspectingBooking, setInspectingBooking] = useState(null);
    const [managingFixtures, setManagingFixtures] = useState(null);
    const [showCreateTournament, setShowCreateTournament] = useState(false);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', subMessage: '', mode: 'notice', onConfirm: null });
    const [concerts, setConcerts] = useState([]);
    const [festivals, setFestivals] = useState([]);
    const [trashFilter, setTrashFilter] = useState('All');
    const [sportRegFilter, setSportRegFilter] = useState('All');

    const [viewMaster, setViewMaster] = useState(false); // For Concerts/Festivals

    const [newTourney, setNewTourney] = useState({ name: '', sport: sportsOptions.Team[0], date: '', image: '', category: 'Team' });
    const [newFixture, setNewFixture] = useState({ player1: '', player2: '', round_number: 'Quarter Final', time: '10:00 AM' });

    const [showCreateConcert, setShowCreateConcert] = useState(false);
    const [newConcert, setNewConcert] = useState({
        title: '', artist: '', artistBio: '', date: '', time: '', venue: '', city: '', genre: '',
        bannerImage: 'https://images.stockcake.com/public/e/9/5/e95edf44-a5e9-4edd-a9f1-ac12ba3056f3_large/neon-concert-experience-stockcake.jpg',
        thumbnail: 'https://i.pinimg.com/736x/f3/80/28/f38028cdd6b44b58ff6b95daa469d4b1.jpg',
        description: '',
        highlights: { genre: 'Pop', crowd: '5000', duration: '2 Hours', type: 'Outdoor', sound: 'Standard' },
        tickets: [
            { type: 'General', price: 999, benefits: 'Standard Entry', total: 1000, sold: 0 }
        ],
        popularTracks: [],
        schedule: [],
        rules: [],
        faqs: [],
        sponsors: []
    });
    const [editingConcert, setEditingConcert] = useState(null);

    const [showCreateFestival, setShowCreateFestival] = useState(false);
    const [newFestival, setNewFestival] = useState({
        name: '', city: '', venue: '', startDate: '', endDate: '', theme: '', image: 'https://images.unsplash.com/photo-1540575861501-7ad0582373f3?q=80&w=2070&auto=format&fit=crop',
        about: '', color: 'rgba(59, 130, 246, 0.9)', secondary: '#FFD700',
        highlights: [
            { icon: '📆', label: '9 Days', detail: 'Full Celebration' }
        ],
        passes: [
            { type: 'Daily Pass', price: 500, days: 'Any 1 Day', benefits: 'General Entry' }
        ],
        attractions: [],
        schedule: [],
        rules: [],
        faqs: [],
        sponsors: []
    });
    const [editingFestival, setEditingFestival] = useState(null);

    const navigate = useNavigate();

    const sanitizeError = (err) => {
        let msg = "An unexpected error occurred.";
        if (err.response?.data) {
            if (typeof err.response.data === 'string') {
                msg = err.response.data;
            } else if (err.response.data.detail) {
                msg = err.response.data.detail;
            } else if (err.response.data.message) {
                msg = err.response.data.message;
            } else {
                msg = JSON.stringify(err.response.data);
            }
        } else if (err.message) {
            msg = err.message;
        }

        if (msg.includes('<!DOCTYPE') || msg.includes('<html')) {
            msg = "Server Error (404/500). The requested endpoint was not found or failed.";
        }
        return msg.substring(0, 150);
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => fetchAllData(true), 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'Weddings') calculateWeddingStats(bookings);
        else if (activeTab === 'Concerts') calculateConcertStats(viewMaster ? concerts : concertBookings);
        else if (activeTab === 'Festivals') calculateFestivalStats(viewMaster ? festivals : festivalBookings);
        else if (activeTab === 'Sports') {
            const revenue = registrations.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
            setStats({
                total: registrations.length,
                pending: registrations.filter(r => r.status === 'Confirmed').length,
                approved: registrations.filter(r => r.status === 'Winner').length,
                revenue: revenue
            });
        } else if (activeTab === 'Employment') {
            setStats({
                total: jobApplications.length,
                pending: jobApplications.filter(j => j.status === 'Applied').length,
                approved: jobApplications.filter(j => j.status === 'Hired').length,
                revenue: 0
            });
        } else if (activeTab === 'Blogs') {
            setStats({
                total: blogs.length,
                pending: blogs.filter(b => b.is_published).length,
                approved: blogs.filter(b => !b.is_published).length,
                revenue: 0
            });
        }
    }, [activeTab, bookings, concertBookings, festivalBookings, registrations, jobApplications, blogs, concerts, festivals, viewMaster]);

    const fetchAllData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [res1, res2, res3, res4, res5, res6, res7, res8, res9, res10] = await Promise.all([
                api.get('/bookings/'),
                api.get('/concert-bookings/'),
                api.get('/festival-bookings/'),
                api.get('/tournaments/'),
                api.get('/sports-registrations/'),
                api.get('/careers/applications/'),
                api.get('/blogs/'),
                api.get('/fixtures/'),
                api.get('/concerts/'),
                api.get('/festivals/')
            ]);
            setBookings(res1.data);
            setConcertBookings(res2.data || []);
            setFestivalBookings(res3.data || []);
            setTournaments(res4.data || []);
            setRegistrations(res5.data || []);
            setJobApplications(res6.data || []);
            setBlogs(res7.data || []);
            setFixtures(res8.data || []);
            setConcerts(res9.data || []);
            setFestivals(res10.data || []);

            // Fetch Deleted Items for Recycle Bin
            const [d1, d2, d3, d4, d5, d6, d7, d8, d9] = await Promise.all([
                api.get('/bookings/?deleted=true'),
                api.get('/concert-bookings/?deleted=true'),
                api.get('/festival-bookings/?deleted=true'),
                api.get('/tournaments/?deleted=true'),
                api.get('/sports-registrations/?deleted=true'),
                api.get('/careers/applications/?deleted=true'),
                api.get('/blogs/?deleted=true'),
                api.get('/concerts/?deleted=true'),
                api.get('/festivals/?deleted=true'),
            ]);

            const allDeleted = [
                ...d1.data.map(i => ({ ...i, _deletedType: 'Wedding' })),
                ...d2.data.map(i => ({ ...i, _deletedType: 'Concert' })),
                ...d3.data.map(i => ({ ...i, _deletedType: 'Festival' })),
                ...d4.data.map(i => ({ ...i, _deletedType: 'Tournament' })),
                ...d5.data.map(i => ({ ...i, _deletedType: 'Sports Reg' })),
                ...d6.data.map(i => ({ ...i, _deletedType: 'Job Application' })),
                ...d7.data.map(i => ({ ...i, _deletedType: 'Blog' })),
                ...d8.data.map(i => ({ ...i, _deletedType: 'Concert Master' })),
                ...d9.data.map(i => ({ ...i, _deletedType: 'Festival Master' })),
            ];
            setDeletedItems(allDeleted);
        } catch (error) {
            console.error(error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // --- AUTO-SAVE LOGIC ---
    useEffect(() => {
        if (!editingConcert && showCreateConcert) {
            localStorage.setItem('concert_draft', JSON.stringify(newConcert));
        }
    }, [newConcert, editingConcert, showCreateConcert]);

    useEffect(() => {
        if (!editingFestival && showCreateFestival) {
            localStorage.setItem('festival_draft', JSON.stringify(newFestival));
        }
    }, [newFestival, editingFestival, showCreateFestival]);



    const calculateWeddingStats = (weddings) => {
        setStats({
            total: weddings.length,
            pending: weddings.filter(b => b.status === 'Pending').length,
            approved: weddings.filter(b => b.status === 'Approved').length,
            revenue: weddings.reduce((acc, curr) => acc + (parseFloat(curr.total_cost) || 0), 0)
        });
    };

    const calculateConcertStats = (data) => {
        if (viewMaster) {
            setStats({
                total: data.length,
                pending: data.filter(c => new Date(c.date) > new Date()).length, // Upcoming
                approved: data.filter(c => new Date(c.date) <= new Date()).length, // Past
                revenue: 0 // Not applicable for master
            });
        } else {
            setStats({
                total: data.length,
                pending: data.filter(c => c.status === 'Pending').length,
                approved: data.filter(c => c.status === 'Confirmed').length,
                revenue: data.reduce((acc, curr) => acc + (parseFloat(curr.total_price) || 0), 0)
            });
        }
    };

    const calculateFestivalStats = (data) => {
        if (viewMaster) {
            setStats({
                total: data.length,
                pending: data.filter(f => new Date(f.startDate) > new Date()).length, // Upcoming
                approved: data.filter(f => new Date(f.startDate) <= new Date()).length, // Past/Live
                revenue: 0 // Not applicable for master
            });
        } else {
            setStats({
                total: data.length,
                pending: data.filter(b => b.status === 'Confirmed').length,
                approved: data.filter(b => b.status === 'Cancelled').length,
                revenue: data.reduce((acc, curr) => acc + (parseFloat(curr.total_price) || 0), 0)
            });
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setCustomAlert({
            show: true,
            title: 'VERIFY',
            message: `Update this booking to ${newStatus}?`,
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    await api.patch(`/admin/bookings/${id}/status/`, { status: newStatus });
                    fetchAllData();
                } catch (error) {
                    setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(error) });
                }
            }
        });
    };

    const handleJobStatus = async (id, newStatus) => {
        try {
            await api.patch(`/careers/applications/${id}/`, { status: newStatus });
            fetchAllData();
        } catch (error) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(error) });
        }
    };

    const handleDeleteItem = async (type, id) => {
        setCustomAlert({
            show: true,
            title: 'RECYCLE BIN',
            message: 'Move this record to Recycle Bin?',
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    let path = "";
                    if (type === 'concert') path = `concert-bookings/${id}/`;
                    else if (type === 'festival') path = `festival-bookings/${id}/`;
                    else if (type === 'wedding') path = `bookings/${id}/`;
                    else if (type === 'tournament') path = `tournaments/${id}/`;
                    else if (type === 'sports-registration') path = `sports-registrations/${id}/`;
                    else if (type === 'fixture') path = `fixtures/${id}/`;
                    else if (type === 'job') path = `careers/applications/${id}/`;
                    else if (type === 'blog') path = `blogs/${id}/`;
                    else if (type === 'concert-master') path = `concerts/${id}/`;
                    else if (type === 'festival-master') path = `festivals/${id}/`;

                    await api.delete(path);
                    fetchAllData();
                    setCustomAlert({ show: true, title: 'DELETED', message: 'Record removed successfully.' });
                } catch (err) {
                    setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
                }
            }
        });
    };

    const handleRestoreItem = async (item) => {
        const typeMap = {
            'Wedding': 'wedding',
            'Concert': 'concert',
            'Festival': 'festival',
            'Tournament': 'tournament',
            'Sports Reg': 'sports-registration',
            'Job Application': 'job',
            'Blog': 'blog',
            'Concert Master': 'concert-master',
            'Festival Master': 'festival-master'
        };

        const backendType = typeMap[item._deletedType];

        setCustomAlert({
            show: true,
            title: 'RESTORE',
            message: `Bring this ${item._deletedType} back to active records?`,
            mode: 'confirm',
            onConfirm: async () => {
                setCustomAlert({ show: false });
                try {
                    await api.post(`/admin/restore/${item.id}/`, { type: backendType });
                    fetchAllData();
                    setCustomAlert({ show: true, title: 'RESTORED', message: 'Record has been moved back successfully.' });
                } catch (err) {
                    setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
                }
            }
        });
    };

    const handleCreateTournament = async () => {
        try {
            await api.post('/tournaments/', newTourney);
            setShowCreateTournament(false);
            setNewTourney({ name: '', sport: 'Cricket', date: '', image: '', category: 'Team' });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Tournament Launched!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleCreateFixture = async () => {
        try {
            await api.post('/fixtures/', { ...newFixture, tournament: managingFixtures.id });
            setNewFixture({ player1: '', player2: '', round_number: '', time: '10:00 AM' });
            fetchAllData();
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleSelectWinner = async (fixtureId, winnerId) => {
        try {
            await api.patch(`/fixtures/${fixtureId}/`, {
                winner: winnerId,
                status: 'Completed'
            });
            fetchAllData();
            setCustomAlert({ show: true, title: 'UPDATED', message: 'Winner selected. Loser has been eliminated.' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleBlogSubmit = async () => {
        try {
            if (editingBlog) await api.put(`/blogs/${editingBlog.id}/`, blogForm);
            else await api.post('/blogs/', blogForm);
            setShowCreateBlog(false);
            setEditingBlog(null);
            setBlogForm({ title: '', content: '', image: '', author: 'Admin' });
            fetchAllData();
            setCustomAlert({ show: true, title: 'SUCCESS', message: 'Blog updated!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleTogglePublish = async (blog) => {
        try {
            await api.patch(`/blogs/${blog.id}/`, { is_published: !blog.is_published });
            fetchAllData();
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleCreateConcert = async () => {
        try {
            const data = { ...newConcert };
            if (editingConcert) {
                await api.put(`/concerts/${editingConcert.id}/`, data);
            } else {
                await api.post('/concerts/', data);
                localStorage.removeItem('concert_draft'); // Clear draft on success
            }
            setShowCreateConcert(false);
            setEditingConcert(null);
            setViewMaster(true); // Switch to Master view to show the new concert
            fetchAllData();
            setCustomAlert({ show: true, title: editingConcert ? 'UPDATED' : 'LIVE', message: editingConcert ? 'Concert details updated.' : 'Concert is now active for booking!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleEditConcert = (c) => {
        setEditingConcert(c);
        setNewConcert({ ...c });
        setShowCreateConcert(true);
    };

    const handleCreateFestival = async () => {
        try {
            const data = { ...newFestival };
            if (editingFestival) {
                await api.put(`/festivals/${editingFestival.id}/`, data);
            } else {
                await api.post('/festivals/', data);
                localStorage.removeItem('festival_draft'); // Clear draft on success
            }
            setShowCreateFestival(false);
            setEditingFestival(null);
            setViewMaster(true); // Switch to Master view to show the new festival
            fetchAllData();
            setCustomAlert({ show: true, title: editingFestival ? 'UPDATED' : 'LIVE', message: editingFestival ? 'Festival details updated.' : 'Festival is now live for participants!' });
        } catch (err) {
            setCustomAlert({ show: true, title: 'ERROR', message: sanitizeError(err) });
        }
    };

    const handleEditFestival = (f) => {
        setEditingFestival(f);
        setNewFestival({ ...f });
        setShowCreateFestival(true);
    };

    return (
        <div style={layoutStyles.dashboardWrapper}>
            <aside style={layoutStyles.sidebar}>
                <div style={layoutStyles.logoSection}>
                    <div style={layoutStyles.logoCircle}>EM</div>
                    <span style={layoutStyles.logoText}>ELITE ADMIN</span>
                </div>

                <nav style={layoutStyles.nav}>
                    {[
                        { id: 'Weddings', icon: '💍', label: 'Weddings' },
                        { id: 'Concerts', icon: '🎸', label: 'Concerts' },
                        { id: 'Festivals', icon: '🎪', label: 'Festivals' },
                        { id: 'Sports', icon: '🏆', label: 'Sports' },
                        { id: 'Employment', icon: '💼', label: 'Careers' },
                        { id: 'Blogs', icon: '✍️', label: 'Blogs' },
                        { id: 'Trash', icon: '🗑️', label: 'Recycle Bin' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); }}
                            style={{
                                ...layoutStyles.navItem,
                                background: activeTab === item.id ? '#1D3557' : 'transparent',
                                color: activeTab === item.id ? '#fff' : '#A0AEC0'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <span style={{ fontWeight: '600' }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={layoutStyles.sidebarFooter}>
                    <button onClick={() => { localStorage.clear(); navigate('/admin-login'); }} style={layoutStyles.signOutBtn}>🚪 Sign Out</button>
                </div>
            </aside>

            <main style={layoutStyles.mainContent}>
                <header style={layoutStyles.header}>
                    <h1 style={layoutStyles.headerTitle}>{activeTab === 'Employment' ? 'Careers' : activeTab} Management</h1>
                    <div style={layoutStyles.userBadge}>
                        <div style={layoutStyles.userAvatar}>A</div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Super Admin</div>
                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>Global Access</div>
                        </div>
                    </div>
                </header>

                <div style={layoutStyles.scrollArea}>
                    <div style={layoutStyles.statsGrid}>
                        <StatCard title={activeTab === 'Sports' ? "Total Regs" : "Records"} value={stats.total} color="#3B82F6" icon="📊" />
                        <StatCard title="Pending" value={stats.pending} color="#F59E0B" icon="⏳" />
                        <StatCard title="Approved" value={stats.approved} color="#10B981" icon="🏆" />
                        <StatCard title="Revenue" value={activeTab === 'Employment' || activeTab === 'Blogs' ? '-' : stats.revenue} color="#8B5CF6" icon="💰" isCurrency={activeTab !== 'Employment' && activeTab !== 'Blogs'} />
                    </div>

                    <div style={layoutStyles.card}>
                        <div style={layoutStyles.cardHeader}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{activeTab === 'Trash' ? 'RECYCLE BIN' : activeTab.toUpperCase() + ' LEDGER'}</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {activeTab === 'Trash' && (
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                                        {['All', 'Wedding', 'Concert', 'Festival', 'Sports Reg', 'Job Application', 'Blog', 'Concert Master', 'Festival Master'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setTrashFilter(f)}
                                                style={{
                                                    ...layoutStyles.actionBtnAlt,
                                                    background: trashFilter === f ? '#C4A059' : '#f0f0f0',
                                                    color: trashFilter === f ? '#fff' : '#555',
                                                    border: 'none',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'Concerts' && (
                                    <>
                                        <button onClick={() => setViewMaster(!viewMaster)} style={{ ...layoutStyles.actionBtnPrimary, background: '#475569' }}>
                                            {viewMaster ? '← View Bookings' : 'Manage Events (Edit/Delete)'}
                                        </button>
                                        <button onClick={() => {
                                            setEditingConcert(null);
                                            const draft = localStorage.getItem('concert_draft');
                                            if (draft) {
                                                try {
                                                    setNewConcert(JSON.parse(draft));
                                                } catch (e) { console.error("Draft Error", e); }
                                            } else {
                                                setNewConcert({
                                                    title: '', artist: '', artistBio: '', date: '', time: '', venue: '', city: '', genre: '',
                                                    bannerImage: 'https://images.stockcake.com/public/e/9/5/e95edf44-a5e9-4edd-a9f1-ac12ba3056f3_large/neon-concert-experience-stockcake.jpg',
                                                    thumbnail: 'https://i.pinimg.com/736x/f3/80/28/f38028cdd6b44b58ff6b95daa469d4b1.jpg',
                                                    description: '',
                                                    highlights: { genre: '', crowd: '', duration: '', type: '', sound: '' },
                                                    tickets: [{ type: 'General', price: 0, benefits: '', total: 0, sold: 0 }],
                                                    popularTracks: [],
                                                    schedule: [],
                                                    rules: [],
                                                    faqs: [],
                                                    sponsors: []
                                                });
                                            }
                                            setShowCreateConcert(true);
                                        }} style={layoutStyles.actionBtnPrimary}>+ New Concert</button>
                                    </>
                                )}
                                {activeTab === 'Festivals' && (
                                    <>
                                        <button onClick={() => setViewMaster(!viewMaster)} style={{ ...layoutStyles.actionBtnPrimary, background: '#475569' }}>
                                            {viewMaster ? '← View Bookings' : 'Manage Festivals (Edit/Delete)'}
                                        </button>
                                        <button onClick={() => {
                                            setEditingFestival(null);
                                            const draft = localStorage.getItem('festival_draft');
                                            if (draft) {
                                                setNewFestival(JSON.parse(draft));
                                            } else {
                                                setNewFestival({
                                                    name: '', city: '', venue: '', startDate: '', endDate: '', theme: '', image: 'https://images.unsplash.com/photo-1540575861501-7ad0582373f3?q=80&w=2070&auto=format&fit=crop',
                                                    about: '', color: 'rgba(59, 130, 246, 0.9)', secondary: '#FFD700',
                                                    highlights: [{ icon: '✨', label: '', detail: '' }],
                                                    passes: [{ type: 'Pass', price: 0, days: '', benefits: '' }],
                                                    attractions: [],
                                                    schedule: [],
                                                    rules: [],
                                                    faqs: [],
                                                    sponsors: []
                                                });
                                            }
                                            setShowCreateFestival(true);
                                        }} style={layoutStyles.actionBtnPrimary}>+ New Festival</button>
                                    </>
                                )}
                                {activeTab === 'Sports' && (
                                    <>
                                        <button onClick={() => setViewTournaments(!viewTournaments)} style={layoutStyles.actionBtnAlt}>
                                            {viewTournaments ? '← View Registrations' : 'Manage Tournaments'}
                                        </button>
                                        {viewTournaments ? (
                                            <button onClick={() => setShowCreateTournament(true)} style={layoutStyles.actionBtnPrimary}>+ Create Tournament</button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                                                {['All', 'Winner', 'Eliminated', 'Cancelled'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setSportRegFilter(status)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            background: sportRegFilter === status ? '#3B82F6' : '#fff',
                                                            color: sportRegFilter === status ? '#fff' : '#64748B',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        {status === 'All' ? 'ALL REGS' : status.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                {activeTab === 'Blogs' && <button onClick={() => { setShowCreateBlog(true); setEditingBlog(null); }} style={layoutStyles.actionBtnPrimary}>+ Write Blog</button>}
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={layoutStyles.table}>
                                <thead style={layoutStyles.thead}>
                                    {activeTab === 'Concerts' ? (
                                        viewMaster ? (
                                            <tr><th style={thStyle}>ID</th><th style={thStyle}>Title</th><th style={thStyle}>Artist</th><th style={thStyle}>Venue</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        ) : (
                                            <tr><th style={thStyle}>ID</th><th style={thStyle}>Event</th><th style={thStyle}>User</th><th style={thStyle}>Artist</th><th style={thStyle}>Tickets</th><th style={thStyle}>Total</th><th style={thStyle}>Action</th></tr>
                                        )
                                    ) : activeTab === 'Festivals' ? (
                                        viewMaster ? (
                                            <tr><th style={thStyle}>ID</th><th style={thStyle}>Name</th><th style={thStyle}>City</th><th style={thStyle}>Venue</th><th style={thStyle}>StartDate</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        ) : (
                                            <tr><th style={thStyle}>ID</th><th style={thStyle}>Festival</th><th style={thStyle}>User</th><th style={thStyle}>Pass Type</th><th style={thStyle}>Qty</th><th style={thStyle}>Total</th><th style={thStyle}>Action</th></tr>
                                        )
                                    ) : activeTab === 'Sports' ? (
                                        viewTournaments ? (
                                            <tr><th style={thStyle}>ID</th><th style={thStyle}>Title</th><th style={thStyle}>Sport</th><th style={thStyle}>Type</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        ) : (
                                            <tr><th style={thStyle}>Date</th><th style={thStyle}>Player/Team</th><th style={thStyle}>Sport</th><th style={thStyle}>Tournament</th><th style={thStyle}>Fee</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                        )
                                    ) : activeTab === 'Blogs' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Title</th><th style={thStyle}>Author</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Employment' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Applicant</th><th style={thStyle}>Role</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    ) : activeTab === 'Trash' ? (
                                        <tr><th style={thStyle}>Date</th><th style={thStyle}>Type</th><th style={thStyle}>Title/Owner</th><th style={thStyle}>Original Status</th><th style={thStyle}>Action</th></tr>
                                    ) : (
                                        <tr><th style={thStyle}>ID</th><th style={thStyle}>Client</th><th style={thStyle}>Date</th><th style={thStyle}>Total</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeTab === 'Weddings' && bookings.map(b => {
                                        const eventDate = new Date(b.event_date);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isCompleted = eventDate < today && b.status === 'Approved';

                                        return (
                                            <tr key={b.id} style={layoutStyles.tr}>
                                                <td style={tdStyle}>#WED-{b.id}</td>
                                                <td style={tdStyle}><strong>{b.username}</strong></td>
                                                <td style={tdStyle}>{b.event_date}</td>
                                                <td style={tdStyle}>₹{parseFloat(b.total_cost || 0).toLocaleString()}</td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        ...statusBadge,
                                                        background: isCompleted ? '#3B82F620' : (b.status === 'Approved' ? '#10B98120' : (b.status === 'Rejected' ? '#EF444420' : '#F59E0B20')),
                                                        color: isCompleted ? '#3B82F6' : (b.status === 'Approved' ? '#10B981' : (b.status === 'Rejected' ? '#EF4444' : '#F59E0B'))
                                                    }}>
                                                        {isCompleted ? 'Event Completed' : b.status}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => setInspectingBooking({ ...b, _type: 'wedding' })} style={actionBtn}>View</button>
                                                    <button onClick={() => handleDeleteItem('wedding', b.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {activeTab === 'Concerts' ? (
                                        viewMaster ? (
                                            concerts.map(c => (
                                                <tr key={c.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}>#{c.id}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800' }}>{c.title}</td>
                                                    <td style={tdStyle}>{c.artist}</td>
                                                    <td style={tdStyle}>{c.venue}</td>
                                                    <td style={tdStyle}>{c.date}</td>
                                                    <td style={tdStyle}><span style={{ color: '#10B981', fontWeight: '800' }}>ACTIVE</span></td>
                                                    <td style={tdStyle}>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button onClick={() => handleEditConcert(c)} style={{ ...layoutStyles.actionBtnAlt, background: '#3B82F6', color: '#fff' }}>Edit</button>
                                                            <button onClick={() => handleDeleteItem('concert-master', c.id)} style={layoutStyles.actionBtnAlt}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            concertBookings.map(b => (
                                                <tr key={b.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}>#{b.id}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800' }}>{b.concert_title}</td>
                                                    <td style={tdStyle}><div>{b.username}</div><div style={{ fontSize: '0.75rem', color: '#718096' }}>{b.user_email}</div></td>
                                                    <td style={tdStyle}>{b.artist_name}</td>
                                                    <td style={tdStyle}><div>{b.ticket_type}</div><div style={{ fontSize: '0.75rem', color: '#718096' }}>Qty: {b.quantity}</div></td>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: '#1D4ED8' }}>₹{parseFloat(b.total_price).toLocaleString()}</td>
                                                    <td style={tdStyle}><div style={{ display: 'flex', gap: '5px' }}><button onClick={() => setInspectingBooking({ ...b, _type: 'concert' })} style={layoutStyles.actionBtnAlt}>Inspect</button><button onClick={() => handleDeleteItem('concert', b.id)} style={layoutStyles.actionBtnAlt}>Delete</button></div></td>
                                                </tr>
                                            ))
                                        )
                                    ) : activeTab === 'Festivals' ? (
                                        viewMaster ? (
                                            festivals.map(f => (
                                                <tr key={f.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}>#{f.id}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800' }}>{f.name}</td>
                                                    <td style={tdStyle}>{f.city}</td>
                                                    <td style={tdStyle}>{f.venue}</td>
                                                    <td style={tdStyle}>{f.startDate}</td>
                                                    <td style={tdStyle}><span style={{ color: '#10B981', fontWeight: '800' }}>LIVE</span></td>
                                                    <td style={tdStyle}>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button onClick={() => handleEditFestival(f)} style={{ ...layoutStyles.actionBtnAlt, background: '#3B82F6', color: '#fff' }}>Edit</button>
                                                            <button onClick={() => handleDeleteItem('festival-master', f.id)} style={layoutStyles.actionBtnAlt}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            festivalBookings.map(b => (
                                                <tr key={b.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}>#{b.id}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800' }}>{b.festival_name}</td>
                                                    <td style={tdStyle}><div>{b.username}</div><div style={{ fontSize: '0.75rem', color: '#718096' }}>{b.user_email}</div></td>
                                                    <td style={tdStyle}>{b.pass_type}</td>
                                                    <td style={tdStyle}>{b.quantity}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: '#1D4ED8' }}>₹{parseFloat(b.total_price).toLocaleString()}</td>
                                                    <td style={tdStyle}><div style={{ display: 'flex', gap: '5px' }}><button onClick={() => setInspectingBooking({ ...b, _type: 'festival' })} style={layoutStyles.actionBtnAlt}>Inspect</button><button onClick={() => handleDeleteItem('festival', b.id)} style={layoutStyles.actionBtnAlt}>Delete</button></div></td>
                                                </tr>
                                            ))
                                        )
                                    ) : activeTab === 'Sports' && (
                                        viewTournaments ? (
                                            tournaments.map(t => (
                                                <tr key={t.id} style={layoutStyles.tr}>
                                                    <td style={tdStyle}>#T-{t.id}</td>
                                                    <td style={tdStyle}><strong>{t.name}</strong></td>
                                                    <td style={tdStyle}>{t.sport}</td>
                                                    <td style={tdStyle}><span style={{ ...statusBadge, background: t.category === 'Team' ? '#3B82F620' : '#8B5CF620', color: t.category === 'Team' ? '#3B82F6' : '#8B5CF6' }}>{t.category || 'Team'}</span></td>
                                                    <td style={tdStyle}>{t.date}</td>
                                                    <td style={tdStyle}>{t.status}</td>
                                                    <td style={tdStyle}>
                                                        <button onClick={() => setManagingFixtures(t)} style={actionBtn}>Fixtures</button>
                                                        <button onClick={() => handleDeleteItem('tournament', t.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            registrations.filter(r => sportRegFilter === 'All' || r.status === sportRegFilter).map(r => (
                                                <tr key={r.id} style={{
                                                    ...layoutStyles.tr,
                                                    background: r.status === 'Winner' ? 'linear-gradient(to right, #FFFBEB, #FEF3C7)' : 'transparent',
                                                    borderLeft: r.status === 'Winner' ? '4px solid #F59E0B' : 'transparent'
                                                }}>
                                                    <td style={tdStyle}>{new Date(r.registration_date || r.created_at).toLocaleDateString()}</td>
                                                    <td style={tdStyle}>
                                                        <strong>{r.team_name || r.player_name || r.username}</strong>
                                                        {r.status === 'Winner' && <span style={{ marginLeft: '8px' }}>🏆</span>}
                                                    </td>
                                                    <td style={tdStyle}>{r.sport_name || r.sport}</td>
                                                    <td style={tdStyle}>{r.tournament_name || 'N/A'}</td>
                                                    <td style={tdStyle}>₹{r.price}</td>
                                                    <td style={tdStyle}>{r.status}</td>
                                                    <td style={tdStyle}>
                                                        <button onClick={() => setInspectingBooking({ ...r, _type: 'sports' })} style={actionBtn}>Details</button>
                                                        <button onClick={() => handleDeleteItem('sports-registration', r.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    )}
                                    {activeTab === 'Employment' && jobApplications.map(j => (
                                        <tr key={j.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}>{new Date(j.applied_at).toLocaleDateString()}</td>
                                            <td style={tdStyle}><strong>{j.full_name}</strong></td>
                                            <td style={tdStyle}>{j.position}</td>
                                            <td style={tdStyle}>{j.status}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => setInspectingBooking({ ...j, _type: 'job' })} style={actionBtn}>Review</button>
                                                <button onClick={() => handleDeleteItem('job', j.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Blogs' && blogs.map(b => (
                                        <tr key={b.id} style={layoutStyles.tr}>
                                            <td style={tdStyle}>{new Date(b.created_at).toLocaleDateString()}</td>
                                            <td style={tdStyle}><strong>{b.title}</strong></td>
                                            <td style={tdStyle}>{b.author}</td>
                                            <td style={tdStyle}>{b.is_published ? 'Live' : 'Draft'}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleTogglePublish(b)} style={actionBtn}>{b.is_published ? 'Unpublish' : 'Publish'}</button>
                                                <button onClick={() => { setEditingBlog(b); setBlogForm(b); setShowCreateBlog(true); }} style={{ ...actionBtn, background: '#8B5CF6', marginLeft: '5px' }}>Edit</button>
                                                <button onClick={() => handleDeleteItem('blog', b.id)} style={{ ...actionBtn, background: '#EF4444', marginLeft: '5px' }}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Trash' && deletedItems
                                        .filter(item => trashFilter === 'All' || item._deletedType === trashFilter)
                                        .map((item, idx) => (
                                            <tr key={`${item.id}-${idx}`} style={layoutStyles.tr}>
                                                <td style={tdStyle}>{new Date(item.booking_date || item.created_at || item.applied_at || item.registration_date).toLocaleDateString()}</td>
                                                <td style={tdStyle}><span style={{ ...statusBadge, background: '#eee', color: '#666' }}>{item._deletedType}</span></td>
                                                <td style={tdStyle}>
                                                    <strong>{item.username || item.full_name || item.title || item.name || item.team_name || item.player_name || 'N/A'}</strong>
                                                </td>
                                                <td style={tdStyle}>{item.status || (item.is_published ? 'Published' : 'Draft')}</td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => handleRestoreItem(item)} style={{ ...layoutStyles.actionBtnPrimary, padding: '5px 12px', fontSize: '0.75rem' }}>Restore</button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals restored with premium layout */}
            {inspectingBooking && (
                <div style={layoutStyles.modalOverlay} onClick={() => setInspectingBooking(null)}>
                    <div style={layoutStyles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={layoutStyles.modalHeader}>
                            <h2>{inspectingBooking._type.toUpperCase()} INVOICE</h2>
                            <button onClick={() => setInspectingBooking(null)} style={layoutStyles.closeBtn}>&times;</button>
                        </div>
                        <div style={layoutStyles.modalBody}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                <div><label style={labelStyle}>Client / Couple</label><p style={textValueStyle}>
                                    {inspectingBooking._type === 'wedding' && inspectingBooking.wedding_details?.brideName
                                        ? `${inspectingBooking.wedding_details.brideName} & ${inspectingBooking.wedding_details.groomName}`
                                        : (inspectingBooking.username || inspectingBooking.full_name || 'Individual Client')}
                                </p></div>
                                <div><label style={labelStyle}>Contact Point</label><p style={textValueStyle}>{inspectingBooking.user_email || inspectingBooking.phone || inspectingBooking.email}</p></div>
                            </div>

                            {inspectingBooking._type === 'wedding' && (
                                <>
                                    <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Financial Breakdown</h4>
                                        <BillRow label="Catering Services" sub={inspectingBooking.catering_package || 'Standard Package'} value={inspectingBooking.catering_price} />
                                        <BillRow label="Decor & Ambiance" sub={inspectingBooking.decoration_name || 'Standard Decor'} value={inspectingBooking.decoration_price} />
                                        <BillRow label="Live Performers" sub={inspectingBooking.performer_name || 'None Selected'} value={inspectingBooking.performer_price} />
                                        <div style={{ borderTop: '1px dashed #ddd', margin: '10px 0' }}></div>
                                        <BillRow label="Subtotal" value={inspectingBooking.total_cost} bold />
                                        <BillRow label="Advance Paid" value={inspectingBooking.advance_amount} color="#10B981" />
                                        <BillRow label="Balance Remaining" value={inspectingBooking.balance_amount} color="#F59E0B" />
                                        <div style={{ borderTop: '2px solid #ddd', marginTop: '10px', paddingTop: '10px' }}>
                                            <BillRow label="GRAND TOTAL" value={inspectingBooking.total_cost} bold big color="#EF4444" />
                                        </div>
                                        <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold', color: inspectingBooking.payment_status === 'Fully Paid' ? '#10B981' : '#F59E0B' }}>
                                            Payment Status: {inspectingBooking.payment_status}
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={labelStyle}>Event Scope</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Event Type:</span> <br /> <strong>{inspectingBooking.event_type || 'Wedding'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Wedding Date:</span> <br /> <strong>{inspectingBooking.wedding_details?.weddingDate || inspectingBooking.event_date}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Venue:</span> <br /> <strong>{inspectingBooking.wedding_details?.venueName || 'Imperial Hall'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Destination:</span> <br /> <strong>{inspectingBooking.wedding_details?.isDestinationWedding || 'No'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Guests:</span> <br /> <strong>{inspectingBooking.guests || inspectingBooking.wedding_details?.guestCount}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Theme:</span> <br /> <strong>{inspectingBooking.wedding_details?.weddingTheme || 'Classic Royal'}</strong></div>
                                        </div>
                                        {inspectingBooking.wedding_details?.notes && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#718096' }}>Custom Requests:</span>
                                                <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>{inspectingBooking.wedding_details.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px', marginTop: '20px' }}>
                                        <label style={labelStyle}>Thematic Details</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Color Palette:</span> <br /> <strong>{inspectingBooking.wedding_details?.colorPreferences || 'TBD'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Cultural/Special:</span> <br /> <strong>{inspectingBooking.wedding_details?.culturalRequirements || 'None'}</strong></div>
                                        </div>

                                        {inspectingBooking.wedding_details?.eventsRequired && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#718096' }}>Required Events:</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                                    {Object.entries(inspectingBooking.wedding_details.eventsRequired)
                                                        .filter(([_, value]) => value === true)
                                                        .map(([key]) => (
                                                            <span key={key} style={{ padding: '4px 12px', background: '#C4A05920', color: '#C4A059', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                                {key}
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {inspectingBooking._type === 'concert' && (
                                <>
                                    <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Financial Breakdown</h4>
                                        <BillRow label="Concert" sub={inspectingBooking.concert_title || 'Live Concert'} value="-" />
                                        <BillRow label="Artist" sub={inspectingBooking.artist_name || 'Featured Artist'} value="-" />
                                        <BillRow label="Ticket Type" sub={inspectingBooking.ticket_type || 'General'} value="-" />
                                        <BillRow label="Quantity" sub={`${inspectingBooking.quantity || 1} Ticket(s)`} value="-" />
                                        <BillRow label="Price per Ticket" value={inspectingBooking.total_price && inspectingBooking.quantity ? (parseFloat(inspectingBooking.total_price) / inspectingBooking.quantity).toFixed(2) : '0'} />
                                        <div style={{ borderTop: '1px dashed #ddd', margin: '10px 0' }}></div>
                                        <BillRow label="Subtotal" value={inspectingBooking.total_price} bold />
                                        {inspectingBooking.cancellation_fee > 0 && (
                                            <BillRow label="Cancellation Fee" value={inspectingBooking.cancellation_fee} color="#EF4444" />
                                        )}
                                        {inspectingBooking.refund_amount > 0 && (
                                            <BillRow label="Refund Amount" value={inspectingBooking.refund_amount} color="#10B981" />
                                        )}
                                        <div style={{ borderTop: '2px solid #ddd', marginTop: '10px', paddingTop: '10px' }}>
                                            <BillRow label="TOTAL PAID" value={inspectingBooking.total_price} bold big color="#C4A059" />
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={labelStyle}>Event Details</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Event Date:</span> <br /> <strong>{inspectingBooking.event_date || 'TBD'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Booking Date:</span> <br /> <strong>{new Date(inspectingBooking.booking_date).toLocaleDateString()}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Payment Status:</span> <br /> <strong style={{ color: inspectingBooking.payment_status === 'Paid' ? '#10B981' : '#F59E0B' }}>{inspectingBooking.payment_status}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Booking Status:</span> <br /> <strong style={{ color: inspectingBooking.status === 'Confirmed' ? '#10B981' : inspectingBooking.status === 'Cancelled' ? '#EF4444' : '#F59E0B' }}>{inspectingBooking.status}</strong></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {inspectingBooking._type === 'festival' && (
                                <>
                                    <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Financial Breakdown</h4>
                                        <BillRow label="Festival" sub={inspectingBooking.festival_name || 'Grand Festival'} value="-" />
                                        <BillRow label="Pass Type" sub={inspectingBooking.pass_type || 'General Entry'} value="-" />
                                        <BillRow label="Quantity" sub={`${inspectingBooking.quantity || 1} Pass(es)`} value="-" />
                                        <BillRow label="Price per Pass" value={inspectingBooking.total_price && inspectingBooking.quantity ? (parseFloat(inspectingBooking.total_price) / inspectingBooking.quantity).toFixed(2) : '0'} />
                                        <div style={{ borderTop: '1px dashed #ddd', margin: '10px 0' }}></div>
                                        <BillRow label="Subtotal" value={inspectingBooking.total_price} bold />
                                        {inspectingBooking.cancellation_fee > 0 && (
                                            <BillRow label="Cancellation Fee" value={inspectingBooking.cancellation_fee} color="#EF4444" />
                                        )}
                                        {inspectingBooking.refund_amount > 0 && (
                                            <BillRow label="Refund Amount" value={inspectingBooking.refund_amount} color="#10B981" />
                                        )}
                                        <div style={{ borderTop: '2px solid #ddd', marginTop: '10px', paddingTop: '10px' }}>
                                            <BillRow label="TOTAL PAID" value={inspectingBooking.total_price} bold big color="#8B5CF6" />
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px' }}>
                                        <label style={labelStyle}>Festival Details</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Booking Date:</span> <br /> <strong>{new Date(inspectingBooking.booking_date).toLocaleDateString()}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Booking Status:</span> <br /> <strong style={{ color: inspectingBooking.status === 'Confirmed' ? '#10B981' : inspectingBooking.status === 'Cancelled' ? '#EF4444' : '#F59E0B' }}>{inspectingBooking.status}</strong></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {inspectingBooking._type === 'sports' && (
                                <>
                                    <div style={{ padding: '20px', background: '#F0F9FF', borderRadius: '15px', border: '1px solid #BAE6FD', marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#0369A1' }}>Sports Ledger</h4>
                                        <BillRow label="Tournament" sub={inspectingBooking.tournament_name || 'Sports Cup'} value="-" />
                                        <BillRow label="Category" sub={inspectingBooking.sport || 'General'} value="-" />
                                        <BillRow label="Registration Fee" value={inspectingBooking.price || inspectingBooking.entry_fee || '0'} color="#3B82F6" />

                                        {inspectingBooking.status === 'Winner' && (
                                            <>
                                                <BillRow label="WINNING BONUS (60%)" value={inspectingBooking.winning_amount || '0'} bold color="#10B981" />
                                                <div style={{ borderTop: '2px solid #BAE6FD', marginTop: '10px', paddingTop: '10px' }}>
                                                    <BillRow
                                                        label="TOTAL SETTLEMENT"
                                                        value={(parseFloat(inspectingBooking.price || 0) + parseFloat(inspectingBooking.winning_amount || 0))}
                                                        bold big
                                                        color="#0369A1"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                        <label style={labelStyle}>Participant Details</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Team/Solo Name:</span> <br /> <strong>{inspectingBooking.team_name || inspectingBooking.player_name || inspectingBooking.username}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Captain:</span> <br /> <strong>{inspectingBooking.captain_name || 'N/A'}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Registration Status:</span> <br /> <strong style={{ color: inspectingBooking.status === 'Winner' ? '#10B981' : inspectingBooking.status === 'Confirmed' ? '#3B82F6' : '#F59E0B' }}>{inspectingBooking.status}</strong></div>
                                            <div><span style={{ fontSize: '0.8rem', color: '#718096' }}>Date:</span> <br /> <strong>{new Date(inspectingBooking.created_at || Date.now()).toLocaleDateString()}</strong></div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={labelStyle}>Squad Members ({inspectingBooking.players?.length || 0})</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                            {inspectingBooking.players?.map((p, i) => (
                                                <span key={i} style={{ padding: '6px 14px', background: '#E2E8F0', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>{p || 'Empty'}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Winner controls removed as requested */}
                                </>
                            )}

                            {inspectingBooking._type === 'job' && (
                                <>
                                    <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                        <label style={labelStyle}>Cover Letter / Message</label>
                                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#1A202C' }}>{inspectingBooking.message}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                        <button onClick={() => handleJobStatus(inspectingBooking.id, 'Hired')} style={{ ...manageBtnStyle, background: '#10B981', flex: 1 }}>Hired</button>
                                        <button onClick={() => handleJobStatus(inspectingBooking.id, 'Rejected')} style={{ ...manageBtnStyle, background: '#EF4444', flex: 1 }}>Reject</button>
                                    </div>
                                </>
                            )}

                            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                                {['Pending', 'Confirmed'].includes(inspectingBooking.status) && inspectingBooking._type === 'wedding' && (
                                    <button onClick={() => handleStatusUpdate(inspectingBooking.id, 'Approved')} style={{ ...manageBtnStyle, background: '#10B981', flex: 1 }}>Approve & Verify</button>
                                )}
                                {inspectingBooking.status !== 'Cancelled' && inspectingBooking._type === 'wedding' && (
                                    <button onClick={() => handleStatusUpdate(inspectingBooking.id, 'Cancelled')} style={{ ...manageBtnStyle, background: '#1A202C', flex: 1 }}>Cancel Record</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            )}

            {
                managingFixtures && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setManagingFixtures(null)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2>FIXTURES: {managingFixtures.name}</h2>
                                <button onClick={() => setManagingFixtures(null)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={layoutStyles.modalBody}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 0.5fr', gap: '10px', marginBottom: '30px', background: '#F8FAFC', padding: '20px', borderRadius: '12px' }}>
                                    <select
                                        style={inputStyle}
                                        value={newFixture.player1}
                                        onChange={e => setNewFixture({ ...newFixture, player1: e.target.value })}
                                    >
                                        <option value="">Select {managingFixtures.category === 'Team' ? 'Team 1' : 'Player 1'}</option>
                                        {registrations
                                            .filter(r => r.tournament === managingFixtures.id)
                                            .map(r => (
                                                <option key={r.id} value={r.id}>{r.team_name || r.player_name || r.username}</option>
                                            ))
                                        }
                                    </select>
                                    <select
                                        style={inputStyle}
                                        value={newFixture.player2}
                                        onChange={e => setNewFixture({ ...newFixture, player2: e.target.value })}
                                    >
                                        <option value="">Select {managingFixtures.category === 'Team' ? 'Team 2' : 'Player 2'}</option>
                                        {registrations
                                            .filter(r => r.tournament === managingFixtures.id && r.status !== 'Eliminated')
                                            .map(r => (
                                                <option key={r.id} value={r.id}>{r.team_name || r.player_name || r.username}</option>
                                            ))
                                        }
                                    </select>
                                    <input
                                        placeholder="Round Name (e.g. Heats)"
                                        style={inputStyle}
                                        value={newFixture.round_number}
                                        onChange={e => setNewFixture({ ...newFixture, round_number: e.target.value })}
                                    />
                                    <input type="time" style={inputStyle} value={newFixture.time} onChange={e => setNewFixture({ ...newFixture, time: e.target.value })} />
                                    <button onClick={handleCreateFixture} style={layoutStyles.actionBtnPrimary}>ADD</button>
                                </div>

                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {fixtures.filter(f => f.tournament === managingFixtures.id).map(f => (
                                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '800' }}>{f.player1_name} <span style={{ color: '#EF4444' }}>VS</span> {f.player2_name}</div>
                                                <div style={{ color: '#718096', fontSize: '0.85rem' }}>{f.round_number} | {f.time}</div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                {!f.winner ? (
                                                    <select
                                                        style={{ ...inputStyle, width: 'auto', padding: '5px' }}
                                                        onChange={(e) => handleSelectWinner(f.id, e.target.value)}
                                                    >
                                                        <option value="">Pick Winner</option>
                                                        <option value={f.player1}>{f.player1_name}</option>
                                                        <option value={f.player2}>{f.player2_name}</option>
                                                    </select>
                                                ) : (
                                                    <span style={{ color: '#10B981', fontWeight: '800', fontSize: '0.85rem' }}>✅ Winner: {f.winner_name}</span>
                                                )}
                                                <button onClick={() => handleDeleteItem('fixture', f.id)} style={{ background: '#EF444420', color: '#EF4444', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateTournament && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateTournament(false)}>
                        <div style={layoutStyles.modalContent} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2>NEW CHAMPIONSHIP</h2>
                                <button onClick={() => setShowCreateTournament(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: 'span 2', marginBottom: '10px' }}>
                                    <label style={labelStyle}>Tournament Type</label>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {['Team', 'Solo'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setNewTourney({ ...newTourney, category: cat, sport: sportsOptions[cat][0] })}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: '2px solid',
                                                    borderColor: newTourney.category === cat ? '#3B82F6' : '#E2E8F0',
                                                    background: newTourney.category === cat ? '#3B82F620' : '#fff',
                                                    color: newTourney.category === cat ? '#3B82F6' : '#64748B',
                                                    fontWeight: '800',
                                                    cursor: 'pointer',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                {cat === 'Team' ? '👥 TEAM SPORTS' : '👤 SOLO SPORTS'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div><label style={labelStyle}>T-Name</label><input placeholder="e.g. Summer Cup 2024" style={inputStyle} value={newTourney.name} onChange={e => setNewTourney({ ...newTourney, name: e.target.value })} /></div>
                                <div>
                                    <label style={labelStyle}>Sport ({newTourney.category})</label>
                                    <select
                                        style={inputStyle}
                                        value={newTourney.sport}
                                        onChange={e => setNewTourney({ ...newTourney, sport: e.target.value })}
                                    >
                                        {sportsOptions[newTourney.category].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Event Date</label><input type="date" style={inputStyle} value={newTourney.date} onChange={e => setNewTourney({ ...newTourney, date: e.target.value })} /></div>
                                <div><label style={labelStyle}>Banner URL</label><input placeholder="https://..." style={inputStyle} value={newTourney.image} onChange={e => setNewTourney({ ...newTourney, image: e.target.value })} /></div>
                                <button onClick={handleCreateTournament} style={{ ...layoutStyles.actionBtnPrimary, gridColumn: 'span 2', padding: '15px', marginTop: '10px' }}>LAUNCH TOURNAMENT</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateBlog && (
                    <div style={layoutStyles.modalOverlay} onClick={() => setShowCreateBlog(false)}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2>{editingBlog ? 'EDIT STORY' : 'PUBLISH NEW STORY'}</h2>
                                <button onClick={() => setShowCreateBlog(false)} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div><label style={labelStyle}>Headline</label><input style={inputStyle} value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Author</label><input style={inputStyle} value={blogForm.author} onChange={e => setBlogForm({ ...blogForm, author: e.target.value })} /></div>
                                </div>
                                <div><label style={labelStyle}>Cover Image URL</label><input style={inputStyle} value={blogForm.image} onChange={e => setBlogForm({ ...blogForm, image: e.target.value })} /></div>
                                <div><label style={labelStyle}>Content</label><textarea style={{ ...inputStyle, minHeight: '300px', resize: 'vertical' }} value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} /></div>
                                <button onClick={handleBlogSubmit} style={{ ...layoutStyles.actionBtnPrimary, padding: '18px' }}>SAVE & SYNC</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateConcert && (
                    <div style={layoutStyles.modalOverlay} onClick={() => { setShowCreateConcert(false); setEditingConcert(null); }}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2>{editingConcert ? 'UPDATE CONCERT DETAILS' : 'CREATE CONCERT EXPERIENCE'}</h2>
                                <button onClick={() => { setShowCreateConcert(false); setEditingConcert(null); }} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div><label style={labelStyle}>Show Title</label><input style={inputStyle} value={newConcert.title} onChange={e => setNewConcert({ ...newConcert, title: e.target.value })} /></div>
                                <div><label style={labelStyle}>Artist Name</label><input style={inputStyle} value={newConcert.artist} onChange={e => setNewConcert({ ...newConcert, artist: e.target.value })} /></div>
                                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Artist Bio</label><textarea style={inputStyle} value={newConcert.artistBio} onChange={e => setNewConcert({ ...newConcert, artistBio: e.target.value })} /></div>
                                <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={newConcert.date} onChange={e => setNewConcert({ ...newConcert, date: e.target.value })} /></div>
                                <div><label style={labelStyle}>Booking Deadline</label><input type="date" style={inputStyle} value={newConcert.booking_deadline || ''} onChange={e => setNewConcert({ ...newConcert, booking_deadline: e.target.value })} /></div>
                                <div><label style={labelStyle}>Time</label><input type="time" style={inputStyle} value={newConcert.time} onChange={e => setNewConcert({ ...newConcert, time: e.target.value })} /></div>
                                <div><label style={labelStyle}>Venue</label><input placeholder="e.g. Madison Square Garden" style={inputStyle} value={newConcert.venue} onChange={e => setNewConcert({ ...newConcert, venue: e.target.value })} /></div>
                                <div><label style={labelStyle}>City</label><input placeholder="e.g. New York" style={inputStyle} value={newConcert.city} onChange={e => setNewConcert({ ...newConcert, city: e.target.value })} /></div>
                                <div><label style={labelStyle}>Banner Image URL</label><input style={inputStyle} value={newConcert.bannerImage} onChange={e => setNewConcert({ ...newConcert, bannerImage: e.target.value })} /></div>
                                <div><label style={labelStyle}>Thumbnail URL</label><input style={inputStyle} value={newConcert.thumbnail} onChange={e => setNewConcert({ ...newConcert, thumbnail: e.target.value })} /></div>
                                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Description</label><textarea style={inputStyle} value={newConcert.description} onChange={e => setNewConcert({ ...newConcert, description: e.target.value })} /></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', borderBottom: '2px solid #3B82F6', paddingBottom: '5px', marginBottom: '15px' }}>CONCERT HIGHLIGHTS</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                        <div><label style={labelStyle}>Genre</label><input style={inputStyle} value={newConcert.highlights.genre} onChange={e => setNewConcert({ ...newConcert, genre: e.target.value, highlights: { ...newConcert.highlights, genre: e.target.value } })} /></div>
                                        <div><label style={labelStyle}>Crowd Size</label><input style={inputStyle} value={newConcert.highlights.crowd} onChange={e => setNewConcert({ ...newConcert, highlights: { ...newConcert.highlights, crowd: e.target.value } })} /></div>
                                        <div><label style={labelStyle}>Duration</label><input style={inputStyle} value={newConcert.highlights.duration} onChange={e => setNewConcert({ ...newConcert, highlights: { ...newConcert.highlights, duration: e.target.value } })} /></div>
                                        <div><label style={labelStyle}>Venue Type</label><input style={inputStyle} value={newConcert.highlights.type} onChange={e => setNewConcert({ ...newConcert, highlights: { ...newConcert.highlights, type: e.target.value } })} /></div>
                                        <div><label style={labelStyle}>Sound Quality</label><input style={inputStyle} value={newConcert.highlights.sound} onChange={e => setNewConcert({ ...newConcert, highlights: { ...newConcert.highlights, sound: e.target.value } })} /></div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>TICKET TIERS</h3>
                                        <button onClick={() => setNewConcert({ ...newConcert, tickets: [...newConcert.tickets, { type: '', price: 0, benefits: '', total: 0, sold: 0 }] })} style={{ ...layoutStyles.actionBtnAlt, background: '#10B981', color: '#fff' }}>+ Add Tier</button>
                                    </div>
                                    {newConcert.tickets.map((t, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                                            <div><label style={{ fontSize: '0.7rem' }}>Type</label><input value={t.type} style={inputStyle} onChange={e => {
                                                const nt = [...newConcert.tickets]; nt[idx].type = e.target.value; setNewConcert({ ...newConcert, tickets: nt });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Price (₹)</label><input type="number" value={t.price} style={inputStyle} onChange={e => {
                                                const nt = [...newConcert.tickets]; nt[idx].price = parseInt(e.target.value); setNewConcert({ ...newConcert, tickets: nt });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Benefits</label><input value={t.benefits} style={inputStyle} onChange={e => {
                                                const nt = [...newConcert.tickets]; nt[idx].benefits = e.target.value; setNewConcert({ ...newConcert, tickets: nt });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Total</label><input type="number" value={t.total} style={inputStyle} onChange={e => {
                                                const nt = [...newConcert.tickets]; nt[idx].total = parseInt(e.target.value); setNewConcert({ ...newConcert, tickets: nt });
                                            }} /></div>
                                            <button onClick={() => {
                                                const nt = newConcert.tickets.filter((_, i) => i !== idx);
                                                setNewConcert({ ...newConcert, tickets: nt });
                                            }} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '10px' }}>SCHEDULE & MEDIA</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>Schedule</label><button onClick={() => setNewConcert({ ...newConcert, schedule: [...newConcert.schedule, { time: '', event: '' }] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newConcert.schedule.map((s, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                                    <input placeholder="Time" style={{ ...inputStyle, flex: 1 }} value={s.time} onChange={e => { const ns = [...newConcert.schedule]; ns[idx].time = e.target.value; setNewConcert({ ...newConcert, schedule: ns }); }} />
                                                    <input placeholder="Event" style={{ ...inputStyle, flex: 2 }} value={s.event} onChange={e => { const ns = [...newConcert.schedule]; ns[idx].event = e.target.value; setNewConcert({ ...newConcert, schedule: ns }); }} />
                                                    <button onClick={() => setNewConcert({ ...newConcert, schedule: newConcert.schedule.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>Popular Tracks</label><button onClick={() => setNewConcert({ ...newConcert, popularTracks: [...newConcert.popularTracks, { title: '', duration: '' }] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newConcert.popularTracks.map((t, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                                    <input placeholder="Title" style={{ ...inputStyle, flex: 2 }} value={t.title} onChange={e => { const nt = [...newConcert.popularTracks]; nt[idx].title = e.target.value; setNewConcert({ ...newConcert, popularTracks: nt }); }} />
                                                    <input placeholder="Duration" style={{ ...inputStyle, flex: 1 }} value={t.duration} onChange={e => { const nt = [...newConcert.popularTracks]; nt[idx].duration = e.target.value; setNewConcert({ ...newConcert, popularTracks: nt }); }} />
                                                    <button onClick={() => setNewConcert({ ...newConcert, popularTracks: newConcert.popularTracks.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '10px' }}>POLICIES & FAQS</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>Rules</label><button onClick={() => setNewConcert({ ...newConcert, rules: [...newConcert.rules, ''] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newConcert.rules.map((r, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                                    <input placeholder="Rule..." style={{ ...inputStyle, flex: 1 }} value={r} onChange={e => { const nr = [...newConcert.rules]; nr[idx] = e.target.value; setNewConcert({ ...newConcert, rules: nr }); }} />
                                                    <button onClick={() => setNewConcert({ ...newConcert, rules: newConcert.rules.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>FAQs</label><button onClick={() => setNewConcert({ ...newConcert, faqs: [...newConcert.faqs, { question: '', answer: '' }] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newConcert.faqs.map((f, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px', padding: '5px', border: '1px solid #eee', borderRadius: '5px' }}>
                                                    <input placeholder="Question" style={{ ...inputStyle, fontSize: '0.8rem' }} value={f.question} onChange={e => { const nf = [...newConcert.faqs]; nf[idx].question = e.target.value; setNewConcert({ ...newConcert, faqs: nf }); }} />
                                                    <input placeholder="Answer" style={{ ...inputStyle, fontSize: '0.8rem' }} value={f.answer} onChange={e => { const nf = [...newConcert.faqs]; nf[idx].answer = e.target.value; setNewConcert({ ...newConcert, faqs: nf }); }} />
                                                    <button onClick={() => setNewConcert({ ...newConcert, faqs: newConcert.faqs.filter((_, i) => i !== idx) })} style={{ color: '#EF4444', alignSelf: 'flex-end', fontSize: '0.7rem' }}>Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={labelStyle}>Sponsors</label><button onClick={() => setNewConcert({ ...newConcert, sponsors: [...newConcert.sponsors, ''] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add Sponsor</button></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        {newConcert.sponsors.map((s, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '5px' }}>
                                                <input placeholder="Sponsor Name..." style={inputStyle} value={s} onChange={e => { const ns = [...newConcert.sponsors]; ns[idx] = e.target.value; setNewConcert({ ...newConcert, sponsors: ns }); }} />
                                                <button onClick={() => setNewConcert({ ...newConcert, sponsors: newConcert.sponsors.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleCreateConcert} style={{ ...layoutStyles.actionBtnPrimary, gridColumn: 'span 2', padding: '15px', marginTop: '20px' }}>{editingConcert ? 'SAVE CHANGES' : 'PUBLISH CONCERT'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateFestival && (
                    <div style={layoutStyles.modalOverlay} onClick={() => { setShowCreateFestival(false); setEditingFestival(null); }}>
                        <div style={{ ...layoutStyles.modalContent, maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                            <div style={layoutStyles.modalHeader}>
                                <h2>{editingFestival ? 'UPDATE FESTIVAL PARAMETERS' : 'ANNOUNCE GRAND FESTIVAL'}</h2>
                                <button onClick={() => { setShowCreateFestival(false); setEditingFestival(null); }} style={layoutStyles.closeBtn}>&times;</button>
                            </div>
                            <div style={{ ...layoutStyles.modalBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div><label style={labelStyle}>Festival Name</label><input style={inputStyle} value={newFestival.name} onChange={e => setNewFestival({ ...newFestival, name: e.target.value })} /></div>
                                <div><label style={labelStyle}>Theme</label><input style={inputStyle} value={newFestival.theme} onChange={e => setNewFestival({ ...newFestival, theme: e.target.value })} /></div>
                                <div><label style={labelStyle}>City</label><input style={inputStyle} value={newFestival.city} onChange={e => setNewFestival({ ...newFestival, city: e.target.value })} /></div>
                                <div><label style={labelStyle}>Venue</label><input style={inputStyle} value={newFestival.venue} onChange={e => setNewFestival({ ...newFestival, venue: e.target.value })} /></div>
                                <div><label style={labelStyle}>Start Date</label><input type="date" style={inputStyle} value={newFestival.startDate} onChange={e => setNewFestival({ ...newFestival, startDate: e.target.value })} /></div>
                                <div><label style={labelStyle}>End Date</label><input type="date" style={inputStyle} value={newFestival.endDate} onChange={e => setNewFestival({ ...newFestival, endDate: e.target.value })} /></div>
                                <div><label style={labelStyle}>Booking Deadline</label><input type="date" style={inputStyle} value={newFestival.booking_deadline || ''} onChange={e => setNewFestival({ ...newFestival, booking_deadline: e.target.value })} /></div>
                                <div><label style={labelStyle}>Main Image URL</label><input style={inputStyle} value={newFestival.image} onChange={e => setNewFestival({ ...newFestival, image: e.target.value })} /></div>
                                <div><label style={labelStyle}>Theme Color (RGBA)</label><input style={inputStyle} value={newFestival.color} onChange={e => setNewFestival({ ...newFestival, color: e.target.value })} /></div>
                                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>About Festival</label><textarea style={inputStyle} value={newFestival.about} onChange={e => setNewFestival({ ...newFestival, about: e.target.value })} /></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>FESTIVAL HIGHLIGHTS</h3>
                                        <button onClick={() => setNewFestival({ ...newFestival, highlights: [...newFestival.highlights, { icon: '✨', label: '', detail: '' }] })} style={{ ...layoutStyles.actionBtnAlt, background: '#10B981', color: '#fff' }}>+ Add Highlight</button>
                                    </div>
                                    {newFestival.highlights.map((h, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '0.5fr 1.5fr 2fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                                            <div><label style={{ fontSize: '0.7rem' }}>Icon</label><input value={h.icon} style={inputStyle} onChange={e => {
                                                const nh = [...newFestival.highlights]; nh[idx].icon = e.target.value; setNewFestival({ ...newFestival, highlights: nh });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Label</label><input value={h.label} style={inputStyle} onChange={e => {
                                                const nh = [...newFestival.highlights]; nh[idx].label = e.target.value; setNewFestival({ ...newFestival, highlights: nh });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Detail</label><input value={h.detail} style={inputStyle} onChange={e => {
                                                const nh = [...newFestival.highlights]; nh[idx].detail = e.target.value; setNewFestival({ ...newFestival, highlights: nh });
                                            }} /></div>
                                            <button onClick={() => {
                                                const nh = newFestival.highlights.filter((_, i) => i !== idx);
                                                setNewFestival({ ...newFestival, highlights: nh });
                                            }} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>ENTRY PASSES</h3>
                                        <button onClick={() => setNewFestival({ ...newFestival, passes: [...newFestival.passes, { type: '', price: 0, days: '', benefits: '' }] })} style={{ ...layoutStyles.actionBtnAlt, background: '#10B981', color: '#fff' }}>+ Add Pass</button>
                                    </div>
                                    {newFestival.passes.map((p, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 2fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                                            <div><label style={{ fontSize: '0.7rem' }}>Type</label><input value={p.type} style={inputStyle} onChange={e => {
                                                const np = [...newFestival.passes]; np[idx].type = e.target.value; setNewFestival({ ...newFestival, passes: np });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Price (₹)</label><input type="number" value={p.price} style={inputStyle} onChange={e => {
                                                const np = [...newFestival.passes]; np[idx].price = parseInt(e.target.value); setNewFestival({ ...newFestival, passes: np });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Days</label><input value={p.days} style={inputStyle} onChange={e => {
                                                const np = [...newFestival.passes]; np[idx].days = e.target.value; setNewFestival({ ...newFestival, passes: np });
                                            }} /></div>
                                            <div><label style={{ fontSize: '0.7rem' }}>Benefits</label><input value={p.benefits} style={inputStyle} onChange={e => {
                                                const np = [...newFestival.passes]; np[idx].benefits = e.target.value; setNewFestival({ ...newFestival, passes: np });
                                            }} /></div>
                                            <button onClick={() => {
                                                const np = newFestival.passes.filter((_, i) => i !== idx);
                                                setNewFestival({ ...newFestival, passes: np });
                                            }} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '10px' }}>EXPERIENCES & TIMING</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>Attractions</label><button onClick={() => setNewFestival({ ...newFestival, attractions: [...newFestival.attractions, { name: '', description: '' }] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newFestival.attractions.map((a, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px', padding: '5px', border: '1px solid #eee', borderRadius: '5px' }}>
                                                    <input placeholder="Name" style={{ ...inputStyle, fontSize: '0.8rem' }} value={a.name} onChange={e => { const na = [...newFestival.attractions]; na[idx].name = e.target.value; setNewFestival({ ...newFestival, attractions: na }); }} />
                                                    <input placeholder="Short Bio" style={{ ...inputStyle, fontSize: '0.8rem' }} value={a.description} onChange={e => { const na = [...newFestival.attractions]; na[idx].description = e.target.value; setNewFestival({ ...newFestival, attractions: na }); }} />
                                                    <button onClick={() => setNewFestival({ ...newFestival, attractions: newFestival.attractions.filter((_, i) => i !== idx) })} style={{ color: '#EF4444', alignSelf: 'flex-end', fontSize: '0.7rem' }}>Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>Schedule</label><button onClick={() => setNewFestival({ ...newFestival, schedule: [...newFestival.schedule, { time: '', event: '' }] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newFestival.schedule.map((s, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                                    <input placeholder="Time" style={{ ...inputStyle, flex: 1 }} value={s.time} onChange={e => { const ns = [...newFestival.schedule]; ns[idx].time = e.target.value; setNewFestival({ ...newFestival, schedule: ns }); }} />
                                                    <input placeholder="Event" style={{ ...inputStyle, flex: 2 }} value={s.event} onChange={e => { const ns = [...newFestival.schedule]; ns[idx].event = e.target.value; setNewFestival({ ...newFestival, schedule: ns }); }} />
                                                    <button onClick={() => setNewFestival({ ...newFestival, schedule: newFestival.schedule.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '10px' }}>POLICIES & FAQS</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>Rules</label><button onClick={() => setNewFestival({ ...newFestival, rules: [...newFestival.rules, ''] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newFestival.rules.map((r, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                                    <input placeholder="Rule..." style={{ ...inputStyle, flex: 1 }} value={r} onChange={e => { const nr = [...newFestival.rules]; nr[idx] = e.target.value; setNewFestival({ ...newFestival, rules: nr }); }} />
                                                    <button onClick={() => setNewFestival({ ...newFestival, rules: newFestival.rules.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={{ fontSize: '0.8rem' }}>FAQs</label><button onClick={() => setNewFestival({ ...newFestival, faqs: [...newFestival.faqs, { question: '', answer: '' }] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add</button></div>
                                            {newFestival.faqs.map((f, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px', padding: '5px', border: '1px solid #eee', borderRadius: '5px' }}>
                                                    <input placeholder="Question" style={{ ...inputStyle, fontSize: '0.8rem' }} value={f.question} onChange={e => { const nf = [...newFestival.faqs]; nf[idx].question = e.target.value; setNewFestival({ ...newFestival, faqs: nf }); }} />
                                                    <input placeholder="Answer" style={{ ...inputStyle, fontSize: '0.8rem' }} value={f.answer} onChange={e => { const nf = [...newFestival.faqs]; nf[idx].answer = e.target.value; setNewFestival({ ...newFestival, faqs: nf }); }} />
                                                    <button onClick={() => setNewFestival({ ...newFestival, faqs: newFestival.faqs.filter((_, i) => i !== idx) })} style={{ color: '#EF4444', alignSelf: 'flex-end', fontSize: '0.7rem' }}>Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><label style={labelStyle}>Sponsors</label><button onClick={() => setNewFestival({ ...newFestival, sponsors: [...newFestival.sponsors, ''] })} style={{ ...layoutStyles.actionBtnAlt, padding: '2px 8px' }}>+ Add Sponsor</button></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        {newFestival.sponsors.map((s, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '5px' }}>
                                                <input placeholder="Sponsor Name..." style={inputStyle} value={s} onChange={e => { const ns = [...newFestival.sponsors]; ns[idx] = e.target.value; setNewFestival({ ...newFestival, sponsors: ns }); }} />
                                                <button onClick={() => setNewFestival({ ...newFestival, sponsors: newFestival.sponsors.filter((_, i) => i !== idx) })} style={{ color: '#EF4444' }}>&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleCreateFestival} style={{ ...layoutStyles.actionBtnPrimary, gridColumn: 'span 2', padding: '15px', marginTop: '20px' }}>{editingFestival ? 'SAVE CHANGES' : 'LAUNCH FESTIVAL'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                onConfirm={customAlert.onConfirm}
                title={customAlert.title}
                message={customAlert.message}
                mode={customAlert.mode}
            />
        </div >
    );
};

const layoutStyles = {
    dashboardWrapper: { display: 'flex', height: '100vh', backgroundColor: '#F0F2F5', fontFamily: 'Inter, sans-serif', overflow: 'hidden' },
    sidebar: { width: '280px', backgroundColor: '#0F172A', color: '#fff', display: 'flex', flexDirection: 'column', padding: '30px 20px', flexShrink: 0 },
    logoSection: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px', padding: '0 10px' },
    logoCircle: { width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 10px 15px -3px rgba(30,64,175,0.4)' },
    logoText: { fontSize: '1.25rem', fontWeight: '900', letterSpacing: '1px', color: '#F8FAFC' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: '0.2s all ease' },
    sidebarFooter: { borderTop: '1px solid #1E293B', paddingTop: '20px' },
    signOutBtn: { width: '100%', padding: '14px', background: '#EF444415', color: '#EF4444', border: '1px solid #EF444430', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', transition: '0.3s' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { height: '85px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
    headerTitle: { fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' },
    userBadge: { display: 'flex', alignItems: 'center', gap: '15px' },
    userAvatar: { width: '45px', height: '45px', borderRadius: '14px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#1E293B', border: '1px solid #E2E8F0' },
    scrollArea: { flex: 1, overflowY: 'auto', padding: '40px', scrollBehavior: 'smooth' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' },
    card: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', overflow: 'hidden' },
    cardHeader: { padding: '24px 30px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' },
    actionBtnPrimary: { padding: '12px 24px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' },
    actionBtnAlt: { padding: '12px 24px', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#F8FAFC' },
    tr: { borderBottom: '1px solid #F1F5F9', transition: '0.2s' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
    modalContent: { backgroundColor: '#fff', width: '100%', maxWidth: '650px', borderRadius: '24px', overflowY: 'auto', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' },
    modalHeader: { padding: '25px 35px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' },
    modalBody: { padding: '35px' },
    closeBtn: { fontSize: '2.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontWeight: '300' }
};

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748B', marginBottom: '8px', letterSpacing: '1px' };
const textValueStyle = { margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' };
const statusBadge = { padding: '6px 14px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' };
const actionBtn = { padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#0F172A', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' };
const thStyle = { padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '22px 24px', fontSize: '0.9rem', color: '#334155' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontWeight: '600' };
const manageBtnStyle = { padding: '14px', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '800', cursor: 'pointer', transition: '0.3s' };

const StatCard = ({ title, value, color, icon, isCurrency }) => (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '22px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', borderTop: `6px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{title}</div>
                <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#0F172A' }}>
                    {value === '-' ? '-' : isCurrency ? `₹${(parseFloat(value) || 0).toLocaleString()}` : value}
                </div>
            </div>
            <div style={{ fontSize: '2.2rem', opacity: 0.8 }}>{icon}</div>
        </div>
    </div>
);

export default SimpleAdminDashboard;
