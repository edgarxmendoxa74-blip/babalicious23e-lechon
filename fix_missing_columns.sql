-- Add promo_price if it doesn't exist
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS promo_price DECIMAL(10, 2);

-- Add image if it doesn't exist (just to be safe)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Add out_of_stock if it doesn't exist (redundant but safe)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS out_of_stock BOOLEAN DEFAULT FALSE;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
