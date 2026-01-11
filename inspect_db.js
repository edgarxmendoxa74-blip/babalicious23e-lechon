
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efktptoaamcnzrzadffn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectTable() {
    console.log('Inspecting menu_items table...');

    const { data, error } = await supabase.from('menu_items').select('*').limit(1);

    if (error) {
        console.error('Error selecting:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Found row. Columns:', Object.keys(data[0]));
    } else {
        console.log('Table is empty. Cannot determine columns from row data.');
        // If empty, we might try to insert with different keys to see what succeeds, 
        // but let's try to assume the user's error hint "category" is the way.

        // Let's try to select 'category' specifically
        const { error: colError } = await supabase.from('menu_items').select('category').limit(1);
        if (!colError) console.log('Column "category" EXISTS.');
        else console.log('Column "category" error:', colError.message);

        // Let's try to select 'categoryId' specifically
        const { error: colError2 } = await supabase.from('menu_items').select('categoryId').limit(1);
        if (!colError2) console.log('Column "categoryId" EXISTS.');
        else console.log('Column "categoryId" error:', colError2.message);
    }
}

inspectTable();
