SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    identity_generation
FROM information_schema.columns 
WHERE table_name = 'menu_items';
