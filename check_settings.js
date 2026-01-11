
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efktptoaamcnzrzadffn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStoreSettings() {
    console.log('Fetching store_settings...');
    const { data, error } = await supabase.from('store_settings').select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Store Settings table is EMPTY.');
    } else {
        console.log('--- FOUND STORE SETTINGS ---');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkStoreSettings();
