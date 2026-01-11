ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS out_of_stock BOOLEAN DEFAULT FALSE;

-- Force PostgREST to update its schema cache
NOTIFY pgrst, 'reload config';
