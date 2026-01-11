
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efktptoaamcnzrzadffn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probeColumns() {
    console.log('--- START PROBE ---');

    // Check 'name' again just to be sure
    const candidates = ['name', 'title', 'item_name', 'label', 'description', 'price', 'image', 'photo', 'category', 'category_id'];

    for (const col of candidates) {
        process.stdout.write(`Checking ${col}... `);
        const { error } = await supabase.from('menu_items').select(col).limit(1);
        if (!error) {
            console.log('EXISTS');
        } else {
            console.log('MISSING');
        }
    }
    console.log('--- END PROBE ---');
}

probeColumns();
