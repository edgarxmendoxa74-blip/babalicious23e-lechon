
-- 1. Create Categories (if they don't exist)
INSERT INTO categories (name, sort_order)
SELECT 'Whole Lechon', 1 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Whole Lechon');

INSERT INTO categories (name, sort_order)
SELECT 'Lechon Belly', 2 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Lechon Belly');

INSERT INTO categories (name, sort_order)
SELECT 'Party Box', 3 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Party Box');

-- 2. Clear old items
-- Cast UUID id to text because menu_items.category is text
DELETE FROM menu_items WHERE category_id IN (SELECT id::text FROM categories WHERE name IN ('Whole Lechon', 'Lechon Belly', 'Party Box'));

-- 3. Insert New Items
-- Casting ID to text here as well

-- Whole Lechon
INSERT INTO menu_items (category_id, name, description, price, image, sort_order, variations)
VALUES (
    (SELECT id::text FROM categories WHERE name = 'Whole Lechon'),
    'Whole Lechon',
    'Authentic Filipino Lechon with crispy skin and juicy meat.',
    9000,
    'https://images.unsplash.com/photo-1601620956424-4f811566373b?q=80&w=2070&auto=format&fit=crop',
    1,
    '[
        {"name": "De Leche", "weight": "13-15 kl", "pax": 10, "price": 9000},
        {"name": "Regular", "weight": "17-19 kl", "pax": 15, "price": 10000},
        {"name": "Medium", "weight": "21-23 kl", "pax": 20, "price": 11000},
        {"name": "Large", "weight": "25-27 kl", "pax": 30, "price": 12000},
        {"name": "X-Large", "weight": "29-31 kl", "pax": 40, "price": 13000},
        {"name": "Jumbo 1", "weight": "33-35 kl", "pax": 50, "price": 14000},
        {"name": "Jumbo 2", "weight": "37-39 kl", "pax": 60, "price": 15000},
        {"name": "X Jumbo 1", "weight": "41-43 kl", "pax": 70, "price": 16000},
        {"name": "X Jumbo 2", "weight": "45-47 kl", "pax": 80, "price": 17000},
        {"name": "Super Jumbo (Small)", "weight": "49-51 kl", "pax": 90, "price": 18000},
        {"name": "Super Jumbo (Large)", "weight": "53-55 kl", "pax": 100, "price": 19000}
    ]'::jsonb
);

-- Lechon Belly
INSERT INTO menu_items (category_id, name, description, price, image, sort_order, variations)
VALUES (
    (SELECT id::text FROM categories WHERE name = 'Lechon Belly'),
    'Lechon Belly',
    'Boneless lechon belly rolled with herbs and spices.',
    1600,
    'https://images.unsplash.com/photo-1659267151025-a134a6e5414d?q=80&w=2070&auto=format&fit=crop',
    2,
    '[
        {"name": "2 Kilos", "weight": "2 Kilos", "pax": "5-7", "price": 1600},
        {"name": "3 Kilos", "weight": "3 Kilos", "pax": "8-10", "price": 2100},
        {"name": "5 Kilos", "weight": "5 Kilos", "pax": "12-14", "price": 3500}
    ]'::jsonb
);

-- Party Box
INSERT INTO menu_items (category_id, name, description, price, image, sort_order, variations, addons)
VALUES (
    (SELECT id::text FROM categories WHERE name = 'Party Box'),
    'Party Box',
    'Complete feast for your celebration!' || chr(10) || chr(10) || 'Inclusions:' || chr(10) || '- 2kg Lechon Belly' || chr(10) || '- Fried Chicken (1 whole)' || chr(10) || '- Chinese style Dumplings' || chr(10) || '- Chinese style Meat Canton' || chr(10) || '- Beef Broccoli' || chr(10) || '- Sweet and Sour fish' || chr(10) || '- Hot Shrimp Salad' || chr(10) || '- Free: Large Chinese Fried Rice',
    6000,
    'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=2070&auto=format&fit=crop',
    3,
    '[]'::jsonb,
    '[
        {"name": "Small Chinese fried rice", "price": 300},
        {"name": "Medium Chinese fried rice", "price": 400},
        {"name": "Large Chinese fried rice", "price": 500},
        {"name": "X-Large Plain rice", "price": 300}
    ]'::jsonb
);
