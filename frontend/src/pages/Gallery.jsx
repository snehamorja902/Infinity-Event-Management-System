import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const galleryItems = [
    // ================= DESTINATION WEDDINGS =================
    {
        id: 1,
        category: 'Destination Wedding',
        title: 'Oceanfront Vows',
        image: 'https://www.101honeymoons.co.uk/wp-content/uploads/2010/04/Get-married-at-Meeru-Island-Resort-238x238.jpg',
        location: 'Maldives'
    },
    {
        id: 2,
        category: 'Destination Wedding',
        title: 'Sunset Ceremony',
        image: 'https://www.weddingchicks.com/wp-content/uploads/2022/05/46__1025_20210712_phosart.jpg',
        location: 'Santorini'
    },

    {
        id: 3,
        category: 'Destination Wedding',
        title: 'Tropical Wedding',
        image: 'https://blissfulplans.com/wp-content/uploads/2020/06/Indian-wedding-bali.webp',
        location: 'Bali'
    },

    {
        id: 4,
        category: 'Destination Wedding',
        title: 'Royal Palace Wedding',
        image: 'https://weddedwonderland.com/wp-content/uploads/2024/07/438972993_17895752165994462_9075089692156060762_n.jpg',
        location: 'Udaipur'
    },

    {
        id: 5,
        category: 'Destination Wedding',
        title: 'Classic Heritage Wedding',
        image: 'https://i.pinimg.com/736x/0f/76/dc/0f76dcd4feb9bde91b1fc5d901ef04f2.jpg',
        location: 'Agra'
    },
    {
        id: 6,
        category: 'Destination Wedding',
        title: 'Beach Wedding',
        image: 'https://cdn0.weddingwire.in/vendor/5514/3_2/640/jpg/weddingvenue-joecons-beach-shack-lawn-7_15_455514-169640280683309.jpeg',
        location: 'Goa'
    },


    {
        id: 7,
        category: 'Destination Wedding',
        title: 'Backwaters / Nature',
        image: 'https://tse1.mm.bing.net/th/id/OIP.X3Ok1V198zL4-Pqn7gvCQQHaFD?w=1024&h=699&rs=1&pid=ImgDetMain&o=7&rm=3',
        location: 'Kerala'
    },
    {
        id: 8,
        category: 'Destination Wedding',
        title: 'Mountain / Hill Wedding',
        image: 'https://www.trvme.com/img/tours/kashmir-destination-wedding-im3.jpg',
        location: 'Shimla'
    },

    {
        id: 9,
        category: 'Destination Wedding',
        title: 'Spiritual, minimalist',
        image: 'https://cdn0.weddingwire.in/vendor/5547/3_2/960/jpeg/whatsapp-image-2022-07-20-at-10-04-10-am_15_305547-165831449411998.jpeg',
        location: 'Rishikesh'
    },

    {
        id: 10,
        category: 'Destination Wedding',
        title: 'Desert Palace Wedding',
        image: 'https://shaandaarevents.com/wp-content/uploads/2023/06/Wedding-planner-in-jaisalmer.webp',
        location: 'Jaisalmer'
    },

    // ================= LOCAL WEDDINGS (STRICTLY WEDDING IMAGES) =================
    // ================= LOCAL WEDDINGS (WITH YOUR IMAGE) =================
    {
        id: 11,
        category: 'Local Wedding',
        title: 'Classic Ballroom Wedding',
        image: 'https://www.marriott.com/content/dam/marriott-renditions/dm-static-renditions/mc/us-canada/hws/w/wasbn/en_us/photo/unlimited/assets/mc-wasbn-wedding-ceremony-10166--57044-classic-hor.jpg',
        location: 'Hotel Ballroom'
    },
    {
        id: 12,
        category: 'Local Wedding',
        title: 'Garden Wedding Ceremony',
        image: 'https://tse4.mm.bing.net/th/id/OIP.tFvCtHEUNowx-sYZwajdwAHaJP?rs=1&pid=ImgDetMain&o=7&rm=3',
        location: 'City Garden'
    },
    {
        id: 13,
        category: 'Local Wedding',
        title: 'Beautiful Wedding Scene',
        image: 'https://cdn0.weddingwire.in/vendor/2199/3_2/960/jpg/special-designs_v7.jpeg',
        location: 'Mandap Hall'
    },
    {
        id: 14,
        category: 'Local Wedding',
        title: 'Wedding',
        image: 'https://cdn0.weddingwire.in/vendor/2620/3_2/960/jpg/0o6a6994-1_15_472620-171940151180025.jpeg',
        location: 'Garden Wedding'
    },
    {
        id: 15,
        category: 'Local Wedding',
        title: 'Wedding',
        image: 'https://theaugusta.in/wp-content/uploads/2025/02/DALL%C2%B7E-2025-02-26-15.36.01-A-luxurious-wedding-setup-at-a-high-end-resort-near-Surat-India.-The-scene-features-a-beautifully-decorated-outdoor-mandap-with-floral-arrangements--1024x700.webp',
        location: 'Resort Mandap'
    },
    {
        id: 16,
        category: 'Local Wedding',
        title: 'Wedding Reception Fun',
        image: 'https://images.squarespace-cdn.com/content/v1/57f8e2bd6a496306c8308fe0/1589274384458-AWIM89JPUCQRXDN4RF3K/Farmhouse_Wedding_photographer_intocandid_photography_28.jpg',
        location: 'Farmhouse Wedding'
    },

    // ================= DECORATION =================
    {
        id: 17,
        category: 'Decoration',
        title: 'Floral Wedding Stage',
        image: 'https://i.pinimg.com/originals/55/db/c4/55dbc4855982d81b460bf38cd2f453e9.jpg',
        location: 'Stage'
    },
    {
        id: 18,
        category: 'Decoration',
        title: 'Royal Mandap Decor',
        image: 'https://www.shaadidukaan.com/vogue/wp-content/uploads/2020/02/shutter-down-wedding-decor.jpg',
        location: 'Mandap'
    },
    {
        id: 19,
        category: 'Decoration',
        title: 'Elegant Reception Decor',
        image: 'https://www.weddingsutra.com/images/wedding-images/real_wed/USweddings/radhika-gaurav/radhika-gaurav-img44.jpg',
        location: 'Reception'
    },
    {
        id: 20,
        category: 'Decoration',
        title: 'Entrance Floral Setup',
        image: 'https://i.pinimg.com/originals/24/39/12/243912471ee59b2f22b61800822e1ef6.jpg',
        location: 'Entrance'
    },
    {
        id: 21,
        category: 'Decoration',
        title: 'Hall Decoration',
        image: 'https://i.pinimg.com/736x/c1/94/2b/c1942bb9e8f4e40eac881af294ccb624.jpg',
        location: 'Hall'
    },
    {
        id: 22,
        category: 'Decoration',
        title: 'Floral Setup',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
        location: 'Floral'
    },
    {
        id: 23,
        category: 'Decoration',
        title: 'Food Setup',
        image: 'https://tse1.mm.bing.net/th/id/OIP.pyqej5_VHn4eyuCQPCnUuAHaJO?rs=1&pid=ImgDetMain&o=7&rm=3',
        location: 'Food'
    },

    // ================= PERFORMERS =================
    {
        id: 24,
        category: 'Performer',
        title: 'Live Wedding Singer',
        image: 'https://www.bollywoodshaadis.com/img/article-2021926711072540045000.jpg',
        location: 'Live Stage'
    },
    {
        id: 25,
        category: 'Performer',
        title: 'Wedding Band Performance',
        image: 'https://sssuhe.ac.in/assets/1734089544831.jpg',
        location: 'Band'
    },
    {
        id: 26,
        category: 'Performer',
        title: 'Performance',
        image: 'https://cdn01.justjared.com/wp-content/uploads/2023/12/kennedy-perf/kennedy-center-honors-2023-38.jpg',
        location: 'Performance'
    },
    {
        id: 27,
        category: 'Performer',
        title: 'Live Concert',
        image: 'https://s1.ticketm.net/dam/a/7d5/97b67038-f926-4676-be88-ebf94cb5c7d5_1802151_TABLET_LANDSCAPE_LARGE_16_9.jpg',
        location: 'Live Concert'
    },
    // ================= DJ PARTY =================
    {
        id: 28,
        category: 'DJ Party',
        title: 'DJ Night',
        image: 'https://media.istockphoto.com/photos/dj-playing-the-track-picture-id534758905?b=1&k=20&m=534758905&s=170667a&w=0&h=2rNe3Gm2jbNS9lzZC0KkyYmf7jPpR9cwaxZ9hUrw550=',
        location: 'DJ Floor'
    },
    {
        id: 29,
        category: 'DJ Party',
        title: 'Dance Party',
        image: 'https://media.istockphoto.com/id/535403859/photo/dancing-at-disco.jpg?s=612x612&w=0&k=20&c=mVZX9qAsgnOv8C0t9gR81ofJ0JG20Orc4Io9r4AKNQQ=',
        location: 'Dance Floor'
    },


    {
        id: 100,
        category: 'Destination Wedding',
        title: 'Signature Wedding Moment',
        image: 'https://www.marriott.com/content/dam/marriott-renditions/dm-static-renditions/mc/us-canada/hws/w/wasbn/en_us/photo/unlimited/assets/mc-wasbn-wedding-ceremony-10166--57044-classic-hor.jpg',
        location: 'Luxury Wedding',
        common: true
    },
    {
        id: 101,
        category: 'Decoration',
        title: 'Signature Decor',
        image: 'https://i.pinimg.com/originals/55/db/c4/55dbc4855982d81b460bf38cd2f453e9.jpg',
        location: 'Wedding Decor',
        common: true
    },
    {
        id: 102,
        category: 'Local Wedding',
        title: 'Signature Couple Moment',
        image: 'https://cdn0.weddingwire.in/vendor/2199/3_2/960/jpg/special-designs_v7.jpeg',
        location: 'Wedding Ceremony',
        common: true
    },
    {
        id: 103,
        category: 'carnival party',
        title: 'carnival party',
        image: 'https://i.pinimg.com/1200x/16/d8/d7/16d8d7ada2f87282f34ba95942547e5e.jpg',
        location: 'carnival party',
        common: true
    },
    {
        id: 109,
        category: 'carnival party',
        title: 'carnival party',
        image: 'https://i.pinimg.com/736x/4b/e9/4f/4be94ff819c31f8c7f4cc9250593771b.jpg',
        location: 'carnival party',
        common: true
    },
    {
        id: 110,
        category: 'carnival party',
        title: 'carnival party',
        image: 'https://weddingsutra.com/images/wedding-images/blog-images/pavni-pranav/pavni-pranav-img22.jpg',
        location: 'carnival party',
        common: true
    },
    {
        id: 111,
        category: 'Engagement Party',
        title: 'Engagement Party',
        image: 'https://elementscelebrate.com/wp-content/uploads/2023/12/indian-engagement.jpg',
        location: 'Engagement Party',
        common: true
    },
    {
        id: 112,
        category: 'Engagement Party',
        title: 'Engagement Party',
        image: 'https://i.pinimg.com/736x/66/b4/e5/66b4e54471f1c7a04071b1e499750683.jpg',
        location: 'Engagement Party',
        common: true
    },
    {
        id: 113,
        category: 'Engagement Party',
        title: 'Engagement Party',
        image: 'https://cdn0.weddingwire.in/article/2909/3_2/960/jpg/129092-untitled-design.jpeg',
        location: 'Engagement Party',
        common: true
    },

    // ================= SPORTS (NEW CATEGORY) =================
    {
        id: 201,
        category: 'Sports',
        title: 'Elite Cricket Tournament',
        image: 'https://i.pinimg.com/1200x/2a/99/1a/2a991a8f1f2e99edcb6c25f5e38b62e9.jpg',
        location: 'Stadium'
    },
    {
        id: 202,
        category: 'Sports',
        title: 'Professional Polo Open',
        image: 'https://i.pinimg.com/736x/f2/60/67/f26067d15069908e116ae34e45b6661e.jpg',
        location: 'Polo Ground'
    },
    {
        id: 203,
        category: 'Sports',
        title: 'Championship Football',
        image: 'https://i.pinimg.com/736x/cf/ad/84/cfad8473cd402e12de82e0b8abe812ec.jpg',
        location: 'Sports Complex'
    },
    {
        id: 204,
        category: 'Sports',
        title: 'Indoor Chess Masters',
        image: 'https://i.pinimg.com/1200x/5d/ef/5f/5def5fdbd0c31da24699dc235cb84aff.jpg',
        location: 'Convention Center'
    },

    // ================= CONCERTS & ENTERTAINMENT =================
    {
        id: 301,
        category: 'Concerts & Entertainment',
        title: 'Neon Nights Tour',
        image: 'https://i.pinimg.com/736x/56/7d/20/567d204683703939edfd62e3493c6a99.jpg',
        location: 'Imperial Arena'
    },
    {
        id: 302,
        category: 'Concerts & Entertainment',
        title: 'Rock Unplugged',
        image: 'https://i.pinimg.com/736x/1d/4c/0f/1d4c0fa46d9f8ddbb13dc5fd4dbb8cee.jpg',
        location: 'Grand Theatre'
    },
    {
        id: 303,
        category: 'Concerts & Entertainment',
        title: 'EDM Pulse Festival',
        image: 'https://i.pinimg.com/1200x/e4/f8/a0/e4f8a076088f66a2d9bdd24b7c011701.jpg',
        location: 'Live Stage'
    },

    // ================= FESTIVALS =================
    {
        id: 401,
        category: 'Festivals',
        title: 'Cultural Arts Fest',
        image: 'https://i.pinimg.com/736x/32/a2/d1/32a2d108a3b4086b098263617d0db737.jpg',
        location: 'Open Grounds'
    },
    {
        id: 402,
        category: 'Festivals',
        title: 'Gourmet Food Festival',
        image: 'https://i.pinimg.com/1200x/a6/be/fc/a6befc214d03651e6abd6ee45ca6e766.jpg',
        location: 'City Square'
    },
    {
        id: 403,
        category: 'Festivals',
        title: 'Winter Carnival',
        image: 'https://i.pinimg.com/736x/c8/be/f5/c8bef514f0520ba315042dfb64293c92.jpg',
        location: 'Amusement Park'
    }
];

const Gallery = () => {
    const location = useLocation();
    const [filter, setFilter] = useState((location.state && location.state.filter) || 'All');
    const [cols, setCols] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setCols(1);
            else if (window.innerWidth < 1024) setCols(2);
            else setCols(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Stable heights based on ID to avoid flicker on re-renders while staying "random"
    const getItemHeight = (id) => {
        const heights = [220, 280, 320, 360, 400];
        return heights[id % heights.length];
    };

    const categories = ['All', 'Weddings', 'Sports', 'Concerts & Entertainment', 'Festivals', 'Decoration', 'Performer', 'DJ Party'];

    const filteredItems = React.useMemo(() => {
        let items = [];
        if (filter !== 'All') {
            if (filter === 'Weddings') {
                items = galleryItems.filter(item => item.category === 'Local Wedding' || item.category === 'Destination Wedding');
            } else {
                items = galleryItems.filter(item => item.category === filter);
            }
        } else {
            // ALL TAB LOGIC → Pick balanced selection then shuffle
            const categoryMap = {};
            const result = [];

            galleryItems.forEach(item => {
                if (!categoryMap[item.category]) {
                    categoryMap[item.category] = [];
                }
                if (categoryMap[item.category].length < 4) {
                    categoryMap[item.category].push(item);
                    result.push(item);
                }
            });
            // Fisher-Yates Shuffle for "Uneven" placement
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            items = result;
        }
        return items;
    }, [filter]);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Header */}
            <div style={{
                backgroundColor: '#111',
                padding: '80px 20px',
                textAlign: 'center',
                color: '#fff',
                borderBottom: '1px solid #c5a059'
            }}>
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '3rem',
                    marginBottom: '15px',
                    fontWeight: '300',
                    letterSpacing: '4px'
                }}>GALLERY</h1>
                <div style={{
                    width: '60px',
                    height: '2px',
                    backgroundColor: '#c5a059',
                    margin: '0 auto 20px'
                }}></div>
                <p style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: '#888',
                    fontSize: '1rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>A collection of moments curated by Infinity</p>
            </div>

            {/* Filter Navigation */}
            <div style={{ padding: '40px 20px', backgroundColor: '#fff' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    marginBottom: '50px'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: '8px 0',
                                border: 'none',
                                background: 'none',
                                color: filter === cat ? '#c5a059' : '#111',
                                borderBottom: filter === cat ? '2px solid #c5a059' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Masonry Layout */}
                <div style={{
                    columnCount: cols,
                    columnGap: '20px',
                    padding: '0 10px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {filteredItems.map(item => (
                        <div key={item.id} style={{
                            breakInside: 'avoid',
                            marginBottom: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                            border: '1px solid #eee'
                        }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=60&w=800';
                                }}
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    height: 'auto',
                                    minHeight: getItemHeight(item.id), // Staggering the heights
                                    objectFit: 'cover'
                                }}
                            />

                            <div style={{
                                padding: '15px',
                                backgroundColor: '#fff',
                            }}>
                                <h4 style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Playfair Display', serif",
                                    letterSpacing: '0.5px'
                                }}>{item.title}</h4>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.7rem',
                                    color: '#999',
                                    textTransform: 'uppercase',
                                    fontWeight: '500'
                                }}>
                                    <span>{item.category}</span>
                                    <span>{item.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default Gallery;
