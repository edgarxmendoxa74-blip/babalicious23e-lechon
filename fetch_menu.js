
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efktptoaamcnzrzadffn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchMenu() {
    const { data: categories } = await supabase.from('categories').select('id, name');

    const { data: items, error } = await supabase.from('menu_items')
        .select('*')
        .order('sort_order');

    if (error) {
        console.error('Error fetching menu:', error);
        return;
    }

    if (!items || items.length === 0) {
        console.log('No menu items found in the database.');
        return;
    }

    console.log(`Found ${items.length} items.`);

    const catMap = {};
    categories.forEach(c => catMap[c.id] = c.name);

    console.log('\n--- CURRENT MENU ITEMS ---\n');
    items.forEach(item => {
        const catName = catMap[item.category_id] || 'Unknown Category';
        console.log(`[${catName}] ${item.name}`);
        console.log(`  Description: ${item.description || 'N/A'}`);
        console.log(`  Base Price: P${item.price}`);

        if (item.variations && item.variations.length > 0) {
            console.log('  Variations:');
            item.variations.forEach(v => {
                console.log(`    - ${v.name.padEnd(15)} | Weight: ${v.weight || 'N/A'} | Pax: ${v.pax || 'N/A'} | Price: P${v.price}`);
            });
        }

        if (item.addons && item.addons.length > 0) {
            console.log('  Add-ons:');
            item.addons.forEach(a => {
                console.log(`    - ${a.name} (+P${a.price})`);
            });
        }
        console.log('');
    });
}

fetchMenu();
