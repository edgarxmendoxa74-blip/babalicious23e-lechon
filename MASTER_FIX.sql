-- MASTER_FIX.sql
-- This script consolidates all database fixes for Babalicious Lechon.
-- It ensures that IDs are TEXT to handle both UUIDs and strings,
-- and adds defaults so that new items get a unique ID if not provided.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop constraints safely
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_id_fkey;

-- 3. Ensure columns exist in menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS promo_price DECIMAL(10, 2);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS out_of_stock BOOLEAN DEFAULT FALSE;

-- 4. CATEGORIES: Convert ID to TEXT and add default
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'categories'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE categories ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE categories ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text;

-- 5. MENU ITEMS: Convert ID to TEXT and Category ID to TEXT
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'menu_items'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE menu_items ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE menu_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE menu_items ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE menu_items ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text;

ALTER TABLE menu_items ALTER COLUMN category_id DROP DEFAULT;
ALTER TABLE menu_items ALTER COLUMN category_id TYPE TEXT USING category_id::text;

-- 6. ORDER TYPES: Convert ID to TEXT
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'order_types'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE order_types ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE order_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE order_types ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE order_types ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text;

-- 7. PAYMENT SETTINGS: Convert ID to TEXT
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'payment_settings'::regclass AND attname = 'id' AND attidentity != '') THEN
        ALTER TABLE payment_settings ALTER COLUMN id DROP IDENTITY;
    END IF;
END $$;
ALTER TABLE payment_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE payment_settings ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE payment_settings ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text;

-- 8. Restore Foreign Key
ALTER TABLE menu_items 
ADD CONSTRAINT menu_items_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;

-- 9. SEED DATA
INSERT INTO categories (id, name, sort_order) VALUES 
('lechon', 'Whole Lechon', 0),
('lechon-belly', 'Lechon Belly', 1),
('party-box', 'Party Box', 2),
('silog', 'Silog Series', 3),
('platters', 'Bilao Platters', 4),
('wings', 'Chicken Wings', 5),
('milktea', 'Milktea Series', 6),
('refreshers', 'Refreshers', 7)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO order_types (id, name, is_active) VALUES 
('pickup', 'Pickup', true),
('delivery', 'Delivery', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;

INSERT INTO payment_settings (id, name, account_number, account_name, is_active) VALUES 
('gcash', 'GCash', '', '', true),
('paymaya', 'PayMaya', '', '', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;

-- 10. Fix existing menu_items that might have NULL sort_order
UPDATE menu_items SET sort_order = 0 WHERE sort_order IS NULL;

-- 11. Reload Schema Cache
NOTIFY pgrst, 'reload config';
