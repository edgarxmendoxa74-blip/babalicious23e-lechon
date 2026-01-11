import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efktptoaamcnzrzadffn.supabase.co'
const supabaseKey = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMenuStatus() {
    console.log("--- 1. Checking ID Type of menu_items ---");
    // We can't directly check types via JS client easily without introspection, 
    // but we can infer it by trying to fetch with a string ID.

    // Attempt to fetch 'whole-lechon' which is a string ID
    const { data: item, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', 'whole-lechon')
        .single();

    if (fetchError) {
        console.log("⚠️ Could not fetch 'whole-lechon'. Error:", fetchError.message);
        console.log("   (This likely means the ID column is still UUID-only or the item doesn't exist)");
    } else {
        console.log("✅ Successfully fetched 'whole-lechon'. ID type appears compatible with TEXT.");
    }

    console.log("\n--- 2. Testing UPDATE Operation ---");
    if (item) {
        const { error: updateError } = await supabase
            .from('menu_items')
            .update({ description: item.description + ' ' }) // dummy update
            .eq('id', 'whole-lechon');

        if (updateError) {
            console.error("❌ Update FAILED:", updateError.message);
        } else {
            console.log("✅ Update SUCCEEDED.");
        }
    } else {
        console.log("Skipping update test because item fetch failed.");
    }

    console.log("\n--- 3. Testing INSERT Operation ---");
    const newId = `test-item-${Date.now()}`;
    const { error: insertError } = await supabase
        .from('menu_items')
        .insert([{
            id: newId,
            name: 'Test Item',
            price: 100,
            category_id: 'lechon' // Assuming 'lechon' category exists
        }]);

    if (insertError) {
        console.error("❌ Insert FAILED:", insertError.message);
    } else {
        console.log("✅ Insert SUCCEEDED (Cleaning up...)");
        await supabase.from('menu_items').delete().eq('id', newId);
    }
}

checkMenuStatus();
