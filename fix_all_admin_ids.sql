-- 1. Drop constraints safely
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_id_fkey;

-- 2. CATEGORIES: Handle Identity & Defaults
DO $$ 
BEGIN
    -- Check if it's an identity column and drop if so
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'categories'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE categories ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING id::text;


-- 3. MENU ITEMS: Handle Identity & Defaults
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'menu_items'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE menu_items ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE menu_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE menu_items ALTER COLUMN id TYPE TEXT USING id::text;

-- Update category_id as well
ALTER TABLE menu_items ALTER COLUMN category_id DROP DEFAULT;
ALTER TABLE menu_items ALTER COLUMN category_id TYPE TEXT USING category_id::text;


-- 4. ORDER TYPES: Handle Identity & Defaults
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'order_types'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE order_types ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE order_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE order_types ALTER COLUMN id TYPE TEXT USING id::text;


-- 5. PAYMENT SETTINGS: Handle Identity & Defaults
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'payment_settings'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE payment_settings ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE payment_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE payment_settings ALTER COLUMN id TYPE TEXT USING id::text;


-- 6. Restore Foreign Key
ALTER TABLE menu_items 
ADD CONSTRAINT menu_items_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;


-- 7. SEED DATA (Safe Upserts)
INSERT INTO categories (id, name, sort_order) VALUES 
('lechon', 'Whole Lechon', 0),
('lechon-belly', 'Lechon Belly', 1),
('party-box', 'Party Box', 2),
('silog', 'Silog Series', 3),
('platters', 'Bilao Platters', 4),
('wings', 'Chicken Wings', 5),
('milktea', 'Milktea Series', 6),
('refreshers', 'Refreshers', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_types (id, name, is_active) VALUES 
('pickup', 'Pickup', true),
('delivery', 'Delivery', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO payment_settings (id, name, account_number, account_name, is_active) VALUES 
('gcash', 'GCash', '', '', true),
('paymaya', 'PayMaya', '', '', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Reload Schema Cache
NOTIFY pgrst, 'reload config';
