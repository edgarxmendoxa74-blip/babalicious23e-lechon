
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efktptoaamcnzrzadffn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugDb() {
    console.log('--- DEBUG START ---');

    // 1. Check Categories
    console.log('Checking categories...');
    const { data: cats, error: catError } = await supabase.from('categories').select('*');
    if (catError) console.error('Category Select Error:', catError);
    else console.log('Categories found:', cats ? cats.length : 0);

    if (cats && cats.length > 0) {
        cats.forEach(c => console.log(` - ${c.name} (${c.id})`));
    }

    // 2. Try Insert Dummy Item
    console.log('Attempting dummy insert...');
    const dummy = {
        name: 'Debug Item',
        price: 100,
        category_id: cats && cats.length > 0 ? cats[0].id : null
    };

    if (!dummy.category_id) {
        console.log('No category to insert into. Skipping insert.');
    } else {
        const { data, error: insertError } = await supabase.from('menu_items').insert([dummy]).select();
        if (insertError) {
            console.error('Insert Error Detail:', JSON.stringify(insertError, null, 2));
        } else {
            console.log('Insert Success! Item:', data);
            // Cleanup
            await supabase.from('menu_items').delete().eq('id', data[0].id);
        }
    }

    console.log('--- DEBUG END ---');
}

debugDb();
