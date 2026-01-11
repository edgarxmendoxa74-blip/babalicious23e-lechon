import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Coffee, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const About = () => {
    const [storeSettings, setStoreSettings] = useState({
        store_name: 'Babalicious Lechon',
        logo_url: '/logo.jpg'
    });

    useEffect(() => {
        const fetchStoreSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').limit(1).single();
            if (data) setStoreSettings(data);
        };
        fetchStoreSettings();
    }, []);

    return (
        <div className="page-wrapper">
            <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 1200, background: 'white', borderBottom: 'none' }}>
                <div className="container header-container">
                    <Link to="/" className="brand">
                        <img src={storeSettings.logo_url || "/logo.jpg"} alt="Babalicious Lechon Logo" style={{ height: '60px' }} />
                    </Link>
                    <nav className="header-nav" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link to="/" className="nav-link">Home</Link>
                    </nav>
                </div>
            </header>

            <main className="container" style={{ padding: '80px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: 'var(--primary)' }}>Savor the Flavor of Authentic Lechon</h2>
                        <p style={{ marginBottom: '20px', lineHeight: '1.8' }}>
                            {storeSettings.store_name} began with a simple passion for bringing the most authentic and mouth-watering Lechon to our community. We believe that every celebration deserves the finest roast, prepared with traditional techniques and secret spices passed down through generations.
                        </p>
                        <p style={{ lineHeight: '1.8' }}>
                            Every pig we roast is hand-selected to ensure perfection. From our crispy Whole Lechon Baboy to our flavorful Lechon Belly and Baka, we take pride in delivering a taste that reminds you of home and festivity.
                        </p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80" alt="Cafe Interior" style={{ width: '100%', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }} />
                </div>

            </main>
        </div>
    );
};

export default About;
