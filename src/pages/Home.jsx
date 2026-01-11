import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Minus,
    X,
    MessageSquare,
    MapPin,
    Phone,
    Info,
    Facebook,
    Star,
    Coffee,
    UtensilsCrossed,
    Clock,
    User,
    Trash2,
    Copy,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories as initialCategories, menuItems } from '../data/MenuData';
import { supabase } from '../supabaseClient';

const Home = () => {
    const [cart, setCart] = useState([]);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('lechon'); // Will update after load
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [showDeliveryRates, setShowDeliveryRates] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState([]);
    const [orderTypes, setOrderTypes] = useState([
        { id: 'pickup', name: 'Pickup' },
        { id: 'delivery', name: 'Delivery' }
    ]);
    const [storeSettings, setStoreSettings] = useState({
        manual_status: 'auto',
        open_time: '10:00',
        close_time: '01:00',
        store_name: 'Babalicious Lechon',
        address: 'Poblacion, El Nido, Palawan',
        contact: '09153441453 | 09817614423',
        logo_url: '/logo.jpg',
        banner_images: []
    });

    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Store status logic
    const isStoreOpen = () => {
        if (storeSettings.manual_status === 'open') return true;
        if (storeSettings.manual_status === 'closed') return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [openH, openM] = (storeSettings.open_time || '16:00').split(':').map(Number);
        const [closeH, closeM] = (storeSettings.close_time || '01:00').split(':').map(Number);

        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;

        if (closeMinutes < openMinutes) {
            // Overnights (e.g., 4 PM to 1 AM)
            return currentTime >= openMinutes || currentTime < closeMinutes;
        }
        return currentTime >= openMinutes && currentTime < closeMinutes;
    };

    const isOpen = isStoreOpen();

    // Load data from Supabase (with LocalStorage fallback)
    useEffect(() => {
        const fetchData = async () => {
            // Clear stale local storage to ensure fresh data from Supabase
            localStorage.removeItem('categories');
            localStorage.removeItem('menuItems');

            // 1. Fetch Categories
            const { data: catData } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
            if (catData && catData.length > 0) {
                setCategories(catData);
                setActiveCategory(catData[0].id);
            } else {
                const savedCats = localStorage.getItem('categories');
                if (savedCats) {
                    const parsed = JSON.parse(savedCats);
                    setCategories(parsed);
                    if (parsed.length > 0) setActiveCategory(parsed[0].id);
                } else {
                    setCategories([{ id: 'lechon', name: 'Lechon' }, { id: 'platters', name: 'Platters' }, { id: 'silog', name: 'Silog' }]);
                    setActiveCategory('lechon');
                }
            }

            // 2. Fetch Menu Items
            const { data: itemData } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
            if (itemData && itemData.length > 0) {
                setItems(itemData);
            } else {
                const savedItems = localStorage.getItem('menuItems');
                setItems(savedItems ? JSON.parse(savedItems) : menuItems);
            }

            // 3. Fetch Payment Settings
            const { data: payData } = await supabase.from('payment_settings').select('*').eq('is_active', true);
            if (payData && payData.length > 0) {
                setPaymentSettings(payData);
            } else {
                const savedPayments = localStorage.getItem('paymentSettings');
                if (savedPayments) {
                    const parsed = JSON.parse(savedPayments);
                    setPaymentSettings(Array.isArray(parsed) ? parsed : []);
                }
            }

            // 4. Fetch Order Types
            const { data: typeData } = await supabase.from('order_types').select('*').eq('is_active', true);
            if (typeData && typeData.length > 0) {
                setOrderTypes(typeData);
            } else {
                const savedOrderTypes = localStorage.getItem('orderTypes');
                if (savedOrderTypes) setOrderTypes(JSON.parse(savedOrderTypes));
            }

            // 5. Fetch Store Settings
            const { data: storeData } = await supabase.from('store_settings').select('*').limit(1).single();
            if (storeData) {
                setStoreSettings(storeData);
            } else {
                const savedStore = localStorage.getItem('storeSettings');
                if (savedStore) setStoreSettings(JSON.parse(savedStore));
            }
        };

        fetchData();
    }, []);

    // Slideshow functions
    const nextBanner = () => {
        const count = (storeSettings.banner_images || []).length;
        if (count > 0) setCurrentBannerIndex(prev => (prev + 1) % count);
    };

    const prevBanner = () => {
        const count = (storeSettings.banner_images || []).length;
        if (count > 0) setCurrentBannerIndex(prev => (prev - 1 + count) % count);
    };

    useEffect(() => {
        const bannerCount = (storeSettings.banner_images || []).length;
        if (bannerCount === 0) return;
        const timer = setInterval(nextBanner, 5000);
        return () => clearInterval(timer);
    }, [storeSettings.banner_images]);

    // Selection state for products with options
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectionOptions, setSelectionOptions] = useState({
        variation: null,
        flavors: [],
        addons: []
    });

    // Order type and payment state
    const [orderType, setOrderType] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        contact_number: '',
        address: '',
        landmark: '',
        date_time: '',
        freebie: 'Igado' // Default selection
    });

    const openProductSelection = (item) => {
        const firstVariation = (item.variations || []).find(v => !v.disabled);
        const firstFlavor = (item.flavors || [])[0] || null;

        setSelectedProduct(item);
        setSelectionOptions({
            variation: firstVariation || null,
            flavors: [],
            addons: []
        });
    };

    const addToCart = (item, options) => {
        try {
            console.log('Adding to cart:', item.name, options);
            const cartItemId = `${item.id}-${options.variation?.name || ''}-${options.flavors.sort().join(',')}-${options.addons.map(a => a.name).join(',')}`;
            const existing = cart.find(i => i.cartItemId === cartItemId);

            const variationPrice = options.variation ? Number(options.variation.price) : 0;
            const basePrice = Number(item.promo_price || item.price);

            let price;
            if (item.name?.toLowerCase().includes('pork ribs')) {
                price = basePrice + variationPrice;
            } else {
                price = variationPrice > 0 ? variationPrice : basePrice;
            }
            const addonsPrice = options.addons.reduce((sum, a) => sum + Number(a.price), 0);
            const finalPrice = price + addonsPrice;

            if (existing) {
                setCart(cart.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
            } else {
                setCart([...cart, {
                    ...item,
                    cartItemId,
                    selectedVariation: options.variation,
                    selectedFlavors: options.flavors,
                    selectedAddons: options.addons,
                    finalPrice,
                    quantity: 1
                }]);
            }
            setSelectedProduct(null);
            setIsCartOpen(true); // Open cart sidebar to show success
            console.log('Item added successfully');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart. Please try again.');
        }
    };

    const removeFromCart = (cartItemId) => {
        setCart(cart.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity > 1 ? i.quantity - 1 : i.quantity } : i));
    };

    const deleteFromCart = (cartItemId) => {
        setCart(cart.filter(i => i.cartItemId !== cartItemId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handlePlaceOrder = () => {
        if (!orderType) {
            alert('Please select an order type (Dine-in, Pickup, or Delivery).');
            return;
        }

        // Validate details...
        const { name, contact_number, address, date_time } = customerDetails;

        if (!name || !contact_number || !date_time) {
            alert('Please provide Name, Contact Number, and Date/Time.');
            return;
        }

        if (orderType === 'delivery' && !address) {
            alert('Please provide Delivery Address for delivery orders.');
            return;
        }

        if (!paymentMethod) { alert('Please select a payment method.'); return; }

        // --- SAVE ORDER TO SUPABASE ---
        // Format: "Item Name (Size) - Price"
        const itemDetails = cart.map(item => {
            let desc = item.name;
            if (item.selectedVariation) desc += ` (${item.selectedVariation.name})`;

            // Calc item total for the "Price" part (Unit price + addons)
            // The user request says "(size and price)", implying unit price or total? usually unit price of that variant.
            // Let's put the final linear price for clarity.
            const unitPrice = item.finalPrice;

            return `${desc} - ₱${unitPrice} (x${item.quantity})`;
        });

        const newOrder = {
            order_type: orderType,
            payment_method: paymentMethod,
            customer_details: customerDetails,
            items: itemDetails,
            total_amount: cartTotal,
            status: 'Pending'
        };

        // Async insert
        supabase.from('orders').insert([newOrder]).then(({ error }) => {
            if (error) console.error('Error saving order to Supabase:', error);
        });

        // Local Storage
        const localOrder = { ...newOrder, id: Date.now(), timestamp: new Date().toISOString() };
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([...existingOrders, localOrder]));

        // --- PREPARE MESSENGER MSG ---
        // Format requested:
        // Order: (size and price)
        // Name:
        // Date and Time:
        // Delivery Address:
        // Nearest Landmark:
        // Contact no.:
        // Freebie: (Igado or Dinuguan)

        const orderListStr = cart.map(item => {
            let v = item.selectedVariation ? `(${item.selectedVariation.name})` : '';
            return `${item.name} ${v} - ₱${item.finalPrice * item.quantity}`;
        }).join('\n');

        const message = `
Order:
${orderListStr}
Total: ₱${cartTotal}

Name: ${customerDetails.name}
Date and Time: ${customerDetails.date_time}
Delivery Address: ${customerDetails.address || 'N/A (Pickup)'}
Nearest Landmark: ${customerDetails.landmark || 'N/A'}
Contact no.: ${customerDetails.contact_number}
Freebie: ${customerDetails.freebie}

Payment Method: ${paymentMethod}
`.trim();

        const messengerUrl = `https://m.me/babaliciouslechon?text=${encodeURIComponent(message)}`;
        window.open(messengerUrl, '_blank');

        // setCart([]); 
        setIsCheckoutOpen(false);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    return (
        <div className="page-wrapper">
            {/* Store Closed Overlay */}
            {!isOpen && (
                <div style={{ background: 'var(--secondary)', color: 'white', textAlign: 'center', padding: '12px', position: 'sticky', top: 0, zIndex: 1200, fontWeight: 700, fontSize: '0.9rem' }}>
                    <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    WE ARE CURRENTLY CLOSED. Our operating hours are {formatTime(storeSettings.open_time) || '4:00 PM'} to {formatTime(storeSettings.close_time) || '1:00 AM'}. Orders are disabled.
                </div>
            )}

            <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 1200, background: 'white', borderBottom: 'none' }}>
                <div className="container header-container">
                    <Link to="/" className="brand">
                        <img src={storeSettings.logo_url || "/logo.jpg"} alt="Babalicious Lechon Logo" style={{ height: '80px', transition: 'height 0.3s ease' }} />
                    </Link>

                    <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <Link to="/contact" className="nav-link">Contact</Link>
                        </div>
                        <button className="btn-accent" onClick={() => setIsCartOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag size={18} />
                            <span>Cart ({cartCount})</span>
                        </button>
                    </nav>
                </div>


            </header>

            {/* Hero Section */}
            <section className="hero-section" style={{ overflow: 'hidden', background: 'var(--primary)' }}>
                <div className="container hero-split">
                    <div className="hero-content animate-fade-up">
                        <h1 style={{ fontSize: '4.5rem', color: 'var(--accent)', textShadow: '4px 4px 0px rgba(0,0,0,0.3)', marginBottom: '10px', lineHeight: '1' }}>
                            GRAB YOUR ORDERS NOW!
                        </h1>
                        <p style={{ fontSize: '1.8rem', color: 'white', fontWeight: 600, textShadow: '2px 2px 0px rgba(0,0,0,0.2)', marginBottom: '30px' }}>
                            Experience the Authentic Filipino Taste!
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '1.1rem', fontWeight: 500 }}>
                                <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={20} color="var(--primary-dark)" />
                                </div>
                                <span>Zone 6 Malued District, Dagupan City, Philippines</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '1.1rem', fontWeight: 500 }}>
                                <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={20} color="var(--primary-dark)" />
                                </div>
                                <span>09153441453</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image-container">
                        {(storeSettings.banner_images || []).length > 0 ? (
                            <>
                                {(storeSettings.banner_images || []).map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt={`Hero Banner ${i + 1}`}
                                        className="hero-image"
                                        style={{
                                            position: i === 0 ? 'relative' : 'absolute',
                                            top: 0,
                                            left: 0,
                                            opacity: currentBannerIndex === i ? 1 : 0,
                                            transition: 'opacity 1s ease-in-out',
                                            zIndex: currentBannerIndex === i ? 1 : 0
                                        }}
                                    />
                                ))}
                                <button onClick={prevBanner} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10 }}><ChevronLeft size={24} color="var(--primary)" /></button>
                                <button onClick={nextBanner} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10 }}><ChevronRight size={24} color="var(--primary)" /></button>
                            </>
                        ) : (
                            <div style={{ padding: '100px', textAlign: 'center', opacity: 0.5 }}>
                                <ImageIcon size={48} />
                                <p>No banner images uploaded.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How to Order Guide with Emojis */}
            <div style={{ background: 'white', padding: '25px 0', borderBottom: '1px solid var(--border)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        <span style={{ background: 'var(--accent)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
                        <span>🍱 Choose Food</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        <span style={{ background: 'var(--accent)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
                        <span>🛒 Add to Cart</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        <span style={{ background: 'var(--accent)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
                        <span>✅ Checkout</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        <span style={{ background: 'var(--accent)', color: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>4</span>
                        <span>💬 Send via Messenger</span>
                    </div>
                </div>
            </div>


            <main className="container" id="menu" style={{ padding: '80px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '4rem', marginBottom: '10px', color: 'var(--primary)', fontFamily: 'var(--font-brand)' }}>Our Menu</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Pick your favorites and add them to your cart.</p>
                </div>

                {/* Categories Slider (Now below Menu Header) */}
                <div style={{ marginBottom: '40px' }}>
                    <div className="container" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            id="category-slider"
                            style={{
                                display: 'flex',
                                gap: '12px',
                                overflowX: 'auto',
                                padding: '12px 0',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                scrollBehavior: 'smooth',
                                WebkitOverflowScrolling: 'touch',
                                justifyContent: categories.length < 5 ? 'center' : 'flex-start'
                            }}
                        >
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        padding: '12px 30px',
                                        borderRadius: '50px',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-brand)',
                                        border: 'none',
                                        background: activeCategory === cat.id ? 'var(--primary)' : 'white',
                                        color: activeCategory === cat.id ? 'white' : 'var(--text-dark)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: activeCategory === cat.id ? '0 10px 20px rgba(0, 132, 68, 0.25)' : '0 4px 12px rgba(0,0,0,0.05)',
                                        border: activeCategory === cat.id ? 'none' : '1px solid var(--border)'
                                    }}
                                    onMouseOver={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseOut={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <style>{`
                            #category-slider::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                    </div>
                </div>



                <div className="menu-grid">
                    {items.filter(item => (item.category_id || item.category) === activeCategory).map(item => (
                        <div className="menu-item-card" key={item.id} style={{ opacity: item.out_of_stock ? 0.6 : 1 }}>
                            <div style={{ position: 'relative' }}>
                                <img src={item.image} alt={item.name} className="menu-item-image" />
                                {item.promo_price && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--secondary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>PROMO</span>}
                                {item.out_of_stock && <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, borderRadius: '24px' }}>OUT OF STOCK</span>}
                            </div>
                            <div className="menu-item-info">
                                <h3 className="menu-item-name" style={{ fontFamily: 'var(--font-brand)', fontSize: '1.5rem' }}>{item.name}</h3>
                                <p className="menu-item-desc" style={{ fontFamily: 'var(--font-main)', fontWeight: 400 }}>{item.description}</p>
                                <div className="menu-item-footer">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {item.promo_price ? (
                                            <>
                                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₱{item.price}</span>
                                                <span className="menu-item-price" style={{ color: 'var(--secondary)' }}>₱{item.promo_price}</span>
                                            </>
                                        ) : (
                                            <span className="menu-item-price" style={{ color: 'var(--primary)' }}>₱{item.price}</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn-primary"
                                        disabled={item.out_of_stock || !isOpen}
                                        onClick={() => openProductSelection(item)}
                                        style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'var(--primary)', opacity: (item.out_of_stock || !isOpen) ? 0.5 : 1 }}
                                    >
                                        <Plus size={14} style={{ marginRight: '5px' }} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Selection Modal (Simplified for brevity, assumes logic same as before) */}
            {
                selectedProduct && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'white', maxWidth: '500px', width: '100%', borderRadius: '24px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <img src={selectedProduct.image} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
                                <div>
                                    <h2 style={{ margin: 0 }}>{selectedProduct.name}</h2>
                                    {(selectedProduct.pax || selectedProduct.weight) && (
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', margin: '5px 0' }}>
                                            {selectedProduct.weight && <span>Weight: {selectedProduct.weight}</span>}
                                            {selectedProduct.weight && selectedProduct.pax && <span> • </span>}
                                            {selectedProduct.pax && <span>Good for {selectedProduct.pax} Pax</span>}
                                        </div>
                                    )}
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedProduct.description}</p>
                                </div>
                            </div>

                            {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Select Size/Variation</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {selectedProduct.variations.map(v => (
                                            <button
                                                key={v.name}
                                                disabled={v.disabled}
                                                onClick={() => setSelectionOptions({ ...selectionOptions, variation: v })}
                                                style={{
                                                    padding: '12px 15px',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--primary)',
                                                    background: selectionOptions.variation?.name === v.name ? 'var(--primary)' : 'white',
                                                    color: selectionOptions.variation?.name === v.name ? 'white' : 'var(--primary)',
                                                    cursor: v.disabled ? 'not-allowed' : 'pointer',
                                                    opacity: v.disabled ? 0.3 : 1,
                                                    textAlign: 'left',
                                                    minWidth: '200px',
                                                    flex: '1 1 45%'
                                                }}
                                            >
                                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.name}</div>
                                                {v.weight && <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Weight: {v.weight}</div>}
                                                {v.pax && <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Good for {v.pax} pax</div>}
                                                <div style={{ marginTop: '5px', fontWeight: 800 }}>₱{Number(v.price).toLocaleString()}</div>
                                                {v.disabled && <div style={{ color: 'red', fontSize: '0.8rem' }}>Out of Stock</div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Addons logic */}
                            {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Add-ons (Optional)</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {selectedProduct.addons.map(a => (
                                            <button
                                                key={a.name}
                                                disabled={a.disabled}
                                                onClick={() => {
                                                    const exists = selectionOptions.addons.find(x => x.name === a.name);
                                                    if (exists) {
                                                        setSelectionOptions({ ...selectionOptions, addons: selectionOptions.addons.filter(x => x.name !== a.name) });
                                                    } else {
                                                        setSelectionOptions({ ...selectionOptions, addons: [...selectionOptions.addons, a] });
                                                    }
                                                }}
                                                style={{
                                                    padding: '8px 15px', borderRadius: '10px', border: '1px solid var(--primary)',
                                                    background: selectionOptions.addons.find(x => x.name === a.name) ? 'var(--primary)' : 'white',
                                                    color: selectionOptions.addons.find(x => x.name === a.name) ? 'white' : 'var(--primary)',
                                                    cursor: a.disabled ? 'not-allowed' : 'pointer',
                                                    opacity: a.disabled ? 0.3 : 1
                                                }}
                                            >
                                                + {a.name} (₱{a.price}) {a.disabled && '(Out of Stock)'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedProduct.flavors && selectedProduct.flavors.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Select Flavors (You can pick multiple)</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {selectedProduct.flavors.map(f => {
                                            const name = typeof f === 'string' ? f : f.name;
                                            const disabled = typeof f === 'object' ? f.disabled : false;

                                            if (disabled) return null;

                                            return (
                                                <button
                                                    key={name}
                                                    onClick={() => {
                                                        const exists = selectionOptions.flavors.includes(name);
                                                        let newFlavors;
                                                        if (exists) {
                                                            newFlavors = selectionOptions.flavors.filter(x => x !== name);
                                                        } else {
                                                            newFlavors = [...selectionOptions.flavors, name];
                                                        }
                                                        setSelectionOptions({ ...selectionOptions, flavors: newFlavors });
                                                    }}
                                                    style={{
                                                        padding: '8px 15px', borderRadius: '10px',
                                                        border: '1px solid var(--primary)',
                                                        background: selectionOptions.flavors.includes(name) ? 'var(--primary)' : 'white',
                                                        color: selectionOptions.flavors.includes(name) ? 'white' : 'var(--primary)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <button className="btn-primary" style={{ width: '100%', padding: '15px', fontWeight: 700, fontSize: '1.1rem' }} onClick={() => addToCart(selectedProduct, selectionOptions)}>
                                Add to Cart - ₱{(
                                    (selectionOptions.variation && Number(selectionOptions.variation.price) > 0)
                                        ? (selectedProduct.name?.toLowerCase().includes('pork ribs')
                                            ? Number(selectedProduct.promo_price || selectedProduct.price) + Number(selectionOptions.variation.price)
                                            : Number(selectionOptions.variation.price))
                                        : Number(selectedProduct.promo_price || selectedProduct.price)
                                ) + selectionOptions.addons.reduce((sum, a) => sum + Number(a.price), 0)}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Checkout Modal */}
            {
                isCheckoutOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'white', maxWidth: '500px', width: '100%', borderRadius: '24px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button onClick={() => setIsCheckoutOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ marginBottom: '30px', fontSize: '1.8rem', color: 'var(--primary)' }}>Checkout</h2>

                            <div style={{ marginBottom: '30px' }}>
                                {/* Payment Method */}
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ fontWeight: 700, fontSize: '1rem', display: 'block', marginBottom: '15px' }}>Payment Method</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                        <button
                                            onClick={() => setPaymentMethod('Cash/COD')}
                                            style={{
                                                padding: '15px', borderRadius: '15px', border: '2px solid',
                                                borderColor: paymentMethod === 'Cash/COD' ? 'var(--primary)' : '#e2e8f0',
                                                background: paymentMethod === 'Cash/COD' ? '#f0f9ff' : 'white',
                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>💵</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Cash / COD</div>
                                        </button>
                                        {paymentSettings.map(method => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                style={{
                                                    padding: '15px', borderRadius: '15px', border: '2px solid',
                                                    borderColor: paymentMethod === method.id ? 'var(--primary)' : '#e2e8f0',
                                                    background: paymentMethod === method.id ? '#f0f9ff' : 'white',
                                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>💳</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{method.name}</div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Payment Details Area */}
                                    {paymentMethod && paymentMethod !== 'Cash/COD' && (
                                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                            {paymentSettings.find(m => m.id === paymentMethod) ? (
                                                (() => {
                                                    const method = paymentSettings.find(m => m.id === paymentMethod);
                                                    return (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Send {method.name} Payment</h4>
                                                            {method.qr_url && (
                                                                <div style={{ background: 'white', padding: '10px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
                                                                    <img src={method.qr_url} style={{ width: '180px', height: '180px', borderRadius: '10px', objectFit: 'contain' }} alt="QR Code" />
                                                                </div>
                                                            )}
                                                            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Account Number</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                                                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{method.account_number}</div>
                                                                    <button
                                                                        onClick={() => { navigator.clipboard.writeText(method.account_number); alert('Copied!'); }}
                                                                        style={{ border: 'none', background: 'var(--primary)', color: 'white', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem' }}
                                                                    >
                                                                        <Copy size={14} /> Copy
                                                                    </button>
                                                                </div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{method.account_name}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Details not found.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Order Type & Form here (omitted for brevity, assume exists as before) */}
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ fontWeight: 700, fontSize: '1rem', display: 'block', marginBottom: '15px' }}>Select Order Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                                        {orderTypes.map(type => (
                                            <button key={type.id} onClick={() => setOrderType(type.id)} style={{ padding: '8px', fontSize: '0.9rem', borderRadius: '12px', border: '1px solid var(--primary)', background: orderType === type.id ? 'var(--primary)' : 'white', color: orderType === type.id ? 'white' : 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>{type.name}</button>
                                        ))}
                                    </div>
                                </div>

                                {orderType && (
                                    <div style={{ marginBottom: '30px' }}>
                                        <div style={{ marginBottom: '30px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                                {/* Name */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Name</label>
                                                    <input type="text" value={customerDetails.name} onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Your Full Name" />
                                                </div>

                                                {/* Date and Time */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Date and Time</label>
                                                    <input type="datetime-local" value={customerDetails.date_time} onChange={(e) => setCustomerDetails({ ...customerDetails, date_time: e.target.value })} style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                                                </div>

                                                {/* Delivery Address (Specific to Delivery, or optional for Pickup) */}
                                                {orderType === 'delivery' && (
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Delivery Address</label>
                                                            <button
                                                                onClick={() => setShowDeliveryRates(true)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: 'var(--primary)',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 600,
                                                                    textDecoration: 'underline',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <MapPin size={12} /> View Rates
                                                            </button>
                                                        </div>
                                                        <textarea value={customerDetails.address} onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })} style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Complete Address" />
                                                    </div>
                                                )}

                                                {/* Nearest Landmark */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Nearest Landmark</label>
                                                    <input type="text" value={customerDetails.landmark} onChange={(e) => setCustomerDetails({ ...customerDetails, landmark: e.target.value })} style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Famous landmark near you" />
                                                </div>

                                                {/* Contact No */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Contact no.</label>
                                                    <input type="tel" value={customerDetails.contact_number} onChange={(e) => setCustomerDetails({ ...customerDetails, contact_number: e.target.value })} style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="09xxxxxxxxx" />
                                                </div>

                                                {/* Freebie Selection */}
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Freebie</label>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button
                                                            onClick={() => setCustomerDetails({ ...customerDetails, freebie: 'Igado' })}
                                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--primary)', background: customerDetails.freebie === 'Igado' ? 'var(--primary)' : 'white', color: customerDetails.freebie === 'Igado' ? 'white' : 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            Igado
                                                        </button>
                                                        <button
                                                            onClick={() => setCustomerDetails({ ...customerDetails, freebie: 'Dinuguan' })}
                                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--primary)', background: customerDetails.freebie === 'Dinuguan' ? 'var(--primary)' : 'white', color: customerDetails.freebie === 'Dinuguan' ? 'white' : 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            Dinuguan
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount:</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₱{cartTotal}</span>
                                </div>

                                <button className="btn-accent" onClick={handlePlaceOrder} style={{ width: '100%', padding: '18px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 800, fontSize: '1.1rem' }}>
                                    <MessageSquare size={22} /> Confirm Order
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delivery Rates Modal */}
            {
                showDeliveryRates && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'white', maxWidth: '800px', width: '100%', borderRadius: '24px', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button onClick={() => setShowDeliveryRates(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px', fontSize: '2rem', fontFamily: 'var(--font-brand)' }}>Delivery Price Range</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                {/* FREE */}
                                <div style={{ background: '#f0fdf4', borderRadius: '15px', padding: '20px', border: '2px solid #16a34a' }}>
                                    <div style={{ background: '#16a34a', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, marginBottom: '15px' }}>FREE DELIVERY</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1.1rem', fontWeight: 600, color: '#14532d' }}>
                                        <li>Dagupan</li>
                                        <li>Calasiao</li>
                                        <li>Mangaldan</li>
                                        <li>Binmaley</li>
                                    </ul>
                                </div>

                                {/* 300 */}
                                <div style={{ background: '#fff7ed', borderRadius: '15px', padding: '20px', border: '2px solid #ea580c' }}>
                                    <div style={{ background: '#ea580c', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, marginBottom: '15px' }}>PHP 300</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#7c2d12' }}>
                                        <li>San Fabian</li>
                                        <li>San Jacinto</li>
                                        <li>Manaoag</li>
                                        <li>Mapandan</li>
                                        <li>Sta. Barbara</li>
                                        <li>Lingayen</li>
                                        <li>San Carlos</li>
                                        <li>Malasiqui</li>
                                    </ul>
                                </div>

                                {/* 400 */}
                                <div style={{ background: '#fff7ed', borderRadius: '15px', padding: '20px', border: '2px solid #c2410c' }}>
                                    <div style={{ background: '#c2410c', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, marginBottom: '15px' }}>PHP 400</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#7c2d12' }}>
                                        <li>Labrador</li>
                                        <li>Bugallon</li>
                                        <li>Damortis</li>
                                        <li>Pozorrubio</li>
                                        <li>Laoc</li>
                                        <li>Urdaneta</li>
                                        <li>Basista</li>
                                        <li>Villasis</li>
                                    </ul>
                                </div>

                                {/* 500 */}
                                <div style={{ background: '#fef2f2', borderRadius: '15px', padding: '20px', border: '2px solid #dc2626' }}>
                                    <div style={{ background: '#dc2626', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, marginBottom: '15px' }}>PHP 500</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#7f1d1d' }}>
                                        <li>Sual</li>
                                        <li>Urbiztondo</li>
                                        <li>Bayambang</li>
                                        <li>Rosales</li>
                                        <li>Aguilar</li>
                                        <li>Mangatarem</li>
                                        <li>Asingan</li>
                                        <li>Binalonan</li>
                                        <li>Sison</li>
                                    </ul>
                                </div>

                                {/* 600 */}
                                <div style={{ background: '#fef2f2', borderRadius: '15px', padding: '20px', border: '2px solid #b91c1c' }}>
                                    <div style={{ background: '#b91c1c', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, marginBottom: '15px' }}>PHP 600</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#7f1d1d' }}>
                                        <li>Alaminos</li>
                                        <li>Tayug</li>
                                        <li>Alcala</li>
                                        <li>Bautista</li>
                                        <li>San Manuel</li>
                                    </ul>
                                </div>

                                {/* 1000 */}
                                <div style={{ background: '#991b1b', borderRadius: '15px', padding: '20px', border: '2px solid #7f1d1d' }}>
                                    <div style={{ background: '#7f1d1d', color: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, marginBottom: '15px' }}>PHP 1000</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>
                                        <li>Bolinao</li>
                                        <li>Baguio</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Same Cart Sidebar as before */}
            {
                isCartOpen && (
                    <div style={{ position: 'fixed', top: 0, right: 0, width: '450px', height: '100vh', background: 'white', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 1100, padding: '30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}><h2>Your Cart</h2><button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button></div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {cart.map(item => (
                                <div key={item.cartItemId} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-start' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                                        <p style={{ margin: '2px 0 5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {item.selectedVariation?.name}
                                            {item.selectedFlavors && item.selectedFlavors.length > 0 ? ` | ${item.selectedFlavors.join(', ')}` : ''}
                                        </p>
                                        <span style={{ fontWeight: 700 }}>₱{item.finalPrice}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => removeFromCart(item.cartItemId)} style={{ border: '1px solid var(--border)', background: 'none', padding: '2px', borderRadius: '4px' }}><Minus size={14} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => addToCart(item, { variation: item.selectedVariation, flavors: item.selectedFlavors, addons: item.selectedAddons })} style={{ border: '1px solid var(--border)', background: 'none', padding: '2px', borderRadius: '4px' }}><Plus size={14} /></button>
                                        <button onClick={() => deleteFromCart(item.cartItemId)} style={{ marginLeft: '5px', color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} style={{ width: '100%', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 800 }}>Proceed to Checkout</button>
                    </div>
                )
            }
        </div >
    );
};

export default Home;
