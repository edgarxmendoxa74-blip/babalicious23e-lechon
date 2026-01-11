-- 1. Drop foreign key constraint safely
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_id_fkey;

-- 2. Change columns to TEXT to allow string IDs (like 'lechon')
ALTER TABLE categories ALTER COLUMN id TYPE TEXT;
ALTER TABLE menu_items ALTER COLUMN category_id TYPE TEXT;

-- 3. Restore foreign key constraint
ALTER TABLE menu_items 
ADD CONSTRAINT menu_items_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;

-- 4. Seed initial categories if they don't exist
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

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload config';
