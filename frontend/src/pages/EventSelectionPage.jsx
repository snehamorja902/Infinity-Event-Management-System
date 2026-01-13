import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';
import CustomInquiryModal from '../components/CustomInquiryModal';
import './EventShowcase.css';

const EventSelectionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are coming from a specific category
    const category = location.state?.category || 'Weddings';
    const basicDetails = location.state?.basicDetails;

    // State for multi-selection
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [eventTypes, setEventTypes] = useState([]);
    const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '' });
    const [showInquiry, setShowInquiry] = useState(false);

    // --- Suggestion Logic ---
    const getSuggestions = () => {
        if (!basicDetails) return null;

        let suggestions = [];
        const { weddingTheme, guestCount, venueType, isDestinationWedding } = basicDetails;

        if (weddingTheme === 'Royal') suggestions.push("For a Royal theme, we recommend our 'Grand Wedding' & 'Sangeet' packages with velvet drapes and chandeliers.");
        if (weddingTheme === 'Floral') suggestions.push("Since you love Floral, our 'Mehendi' and 'Day Wedding' setups with fresh marigolds are perfect.");
        if (weddingTheme === 'Modern') suggestions.push("For a Modern look, check out our minimal 'Reception' and 'Cocktail' decor.");

        if (Number(guestCount) > 500) suggestions.push("With 500+ guests, consider our spacious 'Grand Wedding' stage setups.");

        if (venueType === 'Outdoor') suggestions.push("Outdoor venues are great for 'Haldi' and 'Sangeet' under the stars.");
        if (isDestinationWedding === 'Yes') suggestions.push("Planning a Destination Wedding? We have specialized logistics for multi-day events.");

        if (suggestions.length === 0) return "Explore our premium events tailored to your preferences.";

        return suggestions;
    };

    const suggestionList = getSuggestions();

    const weddingEvents = [
        {
            id: 'mehendi',
            name: 'Mehendi Ceremony',
            description: 'Vibrant ritual of henna and joy.',
            image: 'https://i.pinimg.com/736x/98/cc/fc/98ccfc256e1598f8a55a0ec82294e658.jpg'
        },
        {
            id: 'sangeet',
            name: 'Sangeet Night',
            description: 'A night filled with music and dance.',
            image: 'https://img.weddingbazaar.com/photos/pictures/000/497/397/new_medium/RSEngagement21.JPG?1535093183'
        },
        {
            id: 'haldi',
            name: 'Haldi Ceremony',
            description: 'Traditional turmeric ceremony.',
            image: 'https://i.pinimg.com/736x/89/e5/1a/89e51acaa9e2df5ab7dd374a10970e7d.jpg'
        },
        {
            id: 'engagement',
            name: 'Engagement Ceremony',
            description: 'A beautiful beginning of togetherness.',
            image: 'https://assets-news.housing.com/news/wp-content/uploads/2022/01/11220447/wedding-stage-decoration-shutterstock_1193416354-1200x700-compressed.jpg'
        },
        {
            id: 'wedding',
            name: 'Grand Wedding',
            description: 'The royal main event of your celebration.',
            image: 'https://eventsweb.in/wp-content/uploads/2024/12/pexels-fotographiya-wedding-photography-823737813-29492598-1024x683.jpg'
        },
        {
            id: 'reception',
            name: 'Gala Reception',
            description: 'Elegant post-wedding dinner and networking.',
            image: 'https://i.pinimg.com/736x/f4/5b/a2/f45ba230e75e78f3d0bc6fc014cfc974.jpg'
        }
    ];

    const generalEvents = [
        { id: 'birthday', name: 'Birthday Party', description: 'Memorable birthday celebrations.', image: 'https://images.unsplash.com/photo-1530103862676-fa394eb9a656?auto=format&fit=crop&q=80&w=800' },
        { id: 'anniversary', name: 'Anniversary Celebration', description: 'Elegant milestone parties.', image: 'https://images.unsplash.com/photo-1513273159383-c742d127bdb1?auto=format&fit=crop&q=80&w=800' },
        { id: 'corporate', name: 'Corporate Meeting', description: 'Professional settings for teams.', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800' },
        { id: 'product-launch', name: 'Product Launch', description: 'Stunning debuts.', image: 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?auto=format&fit=crop&q=80&w=800' },
        { id: 'festival', name: 'Festival Celebration', description: 'Grand setups for celebrations.', image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=800' },
        { id: 'private-party', name: 'Private Party', description: 'Exclusive gatherings.', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' }
    ];

    useEffect(() => {
        if (category === 'Weddings') {
            if (basicDetails?.eventsRequired) {
                const required = basicDetails.eventsRequired;
                const hasSelection = Object.values(required).some(val => val === true);

                if (hasSelection) {
                    const filtered = weddingEvents.filter(ev => {
                        const key = ev.id.charAt(0).toUpperCase() + ev.id.slice(1);
                        return required[key] === true;
                    });
                    setEventTypes(filtered.length > 0 ? filtered : weddingEvents);
                } else {
                    setEventTypes(weddingEvents);
                }
            } else {
                setEventTypes(weddingEvents);
            }
        } else {
            setEventTypes([...generalEvents, ...weddingEvents]);
        }
    }, [category, basicDetails]);

    // Toggle Selection (Multi-select)
    const toggleEventSelection = (event) => {
        const isSelected = selectedEvents.some(e => e.id === event.id);
        if (isSelected) {
            setSelectedEvents(selectedEvents.filter(e => e.id !== event.id));
        } else {
            setSelectedEvents([...selectedEvents, event]);
        }
    };

    const handleCreateBooking = async () => {
        if (selectedEvents.length === 0) return;

        // If we have basicDetails, we auto-create the booking
        if (basicDetails) {
            setLoading(true);
            try {
                // Combine names: "Mehendi & Sangeet"
                const combinedEventType = selectedEvents.map(e => e.name).join(' & ');

                // Defensive: Ensure date and guests are valid
                const safeDate = basicDetails.weddingDate || new Date().toISOString().split('T')[0];
                const safeGuests = parseInt(basicDetails.guestCount) || 50; // Default to 50 if missing

                const payload = {
                    event_type: combinedEventType,
                    event_date: safeDate,
                    guests: safeGuests,
                    budget: parseFloat(basicDetails.approxBudget) || 0,
                    address: basicDetails.venueName ? `${basicDetails.venueName}, ${basicDetails.venueAddress}` : (basicDetails.venueAddress || "TBD"),
                    wedding_details: {
                        ...basicDetails,
                        selectedEventTypes: selectedEvents.map(e => e.id) // Track IDs specifically
                    }
                };

                console.log("Drafting payload locally:", payload);

                // DRAFT MODE: Save to local storage without Backend interaction yet
                const bookingData = {
                    id: null, // No ID yet, will be created at final review
                    step: 1,
                    guestCount: payload.guests,
                    totalBudget: payload.budget,
                    eventData: payload
                };
                localStorage.setItem('ongoing_booking', JSON.stringify(bookingData));
                navigate('/catering', { state: bookingData });
            } catch (error) {
                console.error("Draft creation failed", error);
                setCustomAlert({
                    show: true,
                    title: 'ERROR',
                    message: "Something went wrong with saving your selection."
                });
            } finally {
                setLoading(false);
            }

        } else {
            // Fallback: Use the first selected event for the old flow
            const cleanName = selectedEvents[0]?.name.replace(/\n/g, ' ').trim();
            navigate('/book-event', {
                state: {
                    eventType: cleanName,
                    basicDetails: basicDetails
                },
            });
        }
    };

    return (
        <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh", paddingBottom: '100px' }}>
            <Navbar />

            {category === 'Weddings' && (
                <div style={{
                    background: 'linear-gradient(135deg, #9C4B86 0%, #D4A5C3 100%)',
                    padding: '15px',
                    textAlign: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(156, 75, 134, 0.3)'
                }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, display: 'inline-block', marginRight: '20px' }}>
                            ✨ Need custom wedding planning?
                        </p>
                        <button
                            onClick={() => setShowInquiry(true)}
                            style={{
                                background: '#FFD700',
                                color: '#111',
                                border: 'none',
                                padding: '5px 20px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Request Custom Plan
                        </button>
                    </div>
                </div>
            )}

            <div className="event-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#111' }}>
                        {category === 'Weddings' ? 'Select Your Events' : 'Select Your Event'}
                    </h1>
                    <p style={{ color: '#666' }}>Tap to select multiple events for your package</p>
                </div>

                {/* AI Suggestions Block */}
                {basicDetails && suggestionList && (
                    <div style={{
                        background: 'linear-gradient(135deg, #fff 0%, #fef3c7 100%)',
                        border: '1px solid #fcd34d',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '50px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '24px' }}>✨</span>
                            <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: '#92400e' }}>
                                Tailored Recommendations for {basicDetails.brideName || 'You'}
                            </h3>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {Array.isArray(suggestionList) ? suggestionList.map((tip, idx) => (
                                <li key={idx} style={{ marginBottom: '8px', display: 'flex', gap: '10px', color: '#4b5563', fontSize: '15px' }}>
                                    <span style={{ color: '#d97706' }}>➜</span> {tip}
                                </li>
                            )) : (
                                <li style={{ color: '#4b5563' }}>{suggestionList}</li>
                            )}
                        </ul>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', marginBottom: '20px', color: '#d97706', fontWeight: 'bold' }}>
                        Creating your booking... Please wait...
                    </div>
                )}

                <div className="event-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '30px',
                    opacity: loading ? 0.5 : 1,
                    pointerEvents: loading ? 'none' : 'auto'
                }}>
                    {eventTypes.map((event) => {
                        const isSelected = selectedEvents.some(e => e.id === event.id);
                        return (
                            <div
                                key={event.id}
                                className="event-card"
                                onClick={() => toggleEventSelection(event)}
                                style={{
                                    background: '#fff',
                                    borderRadius: '15px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? '0 0 0 4px #EAB308, 0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    transform: isSelected ? 'translateY(-5px)' : 'none',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <div className="event-image-wrapper" style={{ height: '250px', overflow: 'hidden', opacity: isSelected ? 0.9 : 1 }}>
                                    <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: '#EAB308', color: 'white',
                                            padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold'
                                        }}>
                                            ✓ Selected
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '20px' }}>
                                    <h3 className="event-title" style={{ margin: '0 0 10px', fontSize: '1.25rem', fontFamily: '"Playfair Display", serif', color: isSelected ? '#ca8a04' : 'inherit' }}>
                                        {event.name}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Footer for Action */}
            {selectedEvents.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    backgroundColor: 'white', padding: '20px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', zIndex: 100
                }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {selectedEvents.length} Event{selectedEvents.length > 1 ? 's' : ''} Selected
                    </div>
                    <button
                        onClick={handleCreateBooking}
                        disabled={loading}
                        style={{
                            backgroundColor: '#EAB308',
                            color: 'white',
                            padding: '12px 40px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(234, 179, 8, 0.4)'
                        }}
                    >
                        {loading ? 'Processing...' : 'Book Selected & Continue →'}
                    </button>
                </div>
            )}

            <CustomAlert
                show={customAlert.show}
                onClose={() => setCustomAlert({ ...customAlert, show: false })}
                title={customAlert.title}
                message={customAlert.message}
            />
            <CustomInquiryModal
                isOpen={showInquiry}
                onClose={() => setShowInquiry(false)}
                eventType="Wedding Style"
            />
        </div>
    );
};

export default EventSelectionPage;
