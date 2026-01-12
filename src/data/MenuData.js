
export const categories = [
    { id: 'lechon', name: 'Whole Lechon' },
    { id: 'lechon-belly', name: 'Lechon Belly' },
    { id: 'party-box', name: 'Party Box' },
];

export const menuItems = [
    {
        id: 'whole-lechon',
        category_id: 'lechon',
        name: 'Whole Lechon',
        description: 'Authentic Filipino Lechon with crispy skin and juicy meat.',
        price: 9000,
        image: 'https://images.unsplash.com/photo-1601620956424-4f811566373b?q=80&w=2070&auto=format&fit=crop',
        variations: [
            { name: 'De Leche', weight: '13-15 kl', pax: 10, price: 9000 },
            { name: 'Regular', weight: '17-19 kl', pax: 15, price: 10000 },
            { name: 'Medium', weight: '21-23 kl', pax: 20, price: 11000 },
            { name: 'Large', weight: '25-27 kl', pax: 30, price: 12000 },
            { name: 'X-Large', weight: '29-31 kl', pax: 40, price: 13000 },
            { name: 'Jumbo 1', weight: '33-35 kl', pax: 50, price: 14000 },
            { name: 'Jumbo 2', weight: '37-39 kl', pax: 60, price: 15000 },
            { name: 'X Jumbo 1', weight: '41-43 kl', pax: 70, price: 16000 },
            { name: 'X Jumbo 2', weight: '45-47 kl', pax: 80, price: 17000 },
            { name: 'Super Jumbo (Small)', weight: '49-51 kl', pax: 90, price: 18000 },
            { name: 'Super Jumbo (Large)', weight: '53-55 kl', pax: 100, price: 19000 }
        ],
        freebies: ['Igado', 'Dinuguan']
    },
    {
        id: 'lechon-belly',
        category_id: 'lechon-belly',
        name: 'Lechon Belly',
        description: 'Boneless lechon belly rolled with herbs and spices.',
        price: 1600,
        image: 'https://images.unsplash.com/photo-1659267151025-a134a6e5414d?q=80&w=2070&auto=format&fit=crop',
        variations: [
            { name: '2 Kilos', weight: '2 Kilos', pax: '5-7', price: 1600 },
            { name: '3 Kilos', weight: '3 Kilos', pax: '8-10', price: 2100 },
            { name: '5 Kilos', weight: '5 Kilos', pax: '12-14', price: 3500 }
        ]
    },
    {
        id: 'party-box',
        category_id: 'party-box',
        name: 'Party Box',
        description: 'Complete feast for your celebration!\n\nInclusions:\n- 2kg Lechon Belly\n- Fried Chicken (1 whole)\n- Chinese style Dumplings\n- Chinese style Meat Canton\n- Beef Broccoli\n- Sweet and Sour fish\n- Hot Shrimp Salad\n- Free: Large Chinese Fried Rice',
        price: 6000,
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=2070&auto=format&fit=crop',
        pax: '15-20',
        addons: [
            { name: 'Small Chinese fried rice', price: 300 },
            { name: 'Medium Chinese fried rice', price: 400 },
            { name: 'Large Chinese fried rice', price: 500 },
            { name: 'X-Large Plain rice', price: 300 }
        ]
    }
];
