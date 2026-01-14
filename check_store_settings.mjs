import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efktptoaamcnzrzadffn.supabase.co';
const supabaseKey = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStoreSettings() {
    const { data, error } = await supabase.from('store_settings').select('contact').limit(1).single();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Current Contact:', data.contact);
    }
}

checkStoreSettings();
