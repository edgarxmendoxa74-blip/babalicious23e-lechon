import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efktptoaamcnzrzadffn.supabase.co'
const supabaseKey = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpsert() {
    console.log("Testing UPSERT with invalid UUID...");

    const mixedCategories = [
        { id: 'lechon', name: 'String ID', sort_order: 0 }, // This should fail if column is UUID
        { name: 'New Valid Cat', sort_order: 1 }            // This would get a new UUID
    ];

    const { data, error } = await supabase
        .from('categories')
        .upsert(mixedCategories)
        .select();

    if (error) {
        console.error("❌ UPSERT Failed:", error.message);
    } else {
        console.log("✅ UPSERT Success!", data);
    }
}

testUpsert();
