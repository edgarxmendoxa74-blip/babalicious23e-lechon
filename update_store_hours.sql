-- Update store opening time to 8:00 AM
UPDATE store_settings
SET open_time = '08:00',
    updated_at = NOW();

-- Ensure manual status is 'auto' so the time check works
UPDATE store_settings
SET manual_status = 'auto';
