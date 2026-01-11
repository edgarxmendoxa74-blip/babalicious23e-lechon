import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efktptoaamcnzrzadffn.supabase.co'
const supabaseKey = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdate() {
    console.log("Testing UPDATE on 'out_of_stock' column...");

    // 1. Get an item
    const { data: items } = await supabase.from('menu_items').select('id, out_of_stock').limit(1);
    if (!items || items.length === 0) {
        console.log("No items to test with.");
        return;
    }
    const item = items[0];
    console.log("Testing on item:", item.id);

    // 2. Try to update it
    const { data, error } = await supabase
        .from('menu_items')
        .update({ out_of_stock: !item.out_of_stock })
        .eq('id', item.id)
        .select();

    if (error) {
        console.error("❌ UPDATE Failed:", error.message);
    } else {
        console.log("✅ UPDATE Success! The API allows updates to this column.");
    }
}

testUpdate();
