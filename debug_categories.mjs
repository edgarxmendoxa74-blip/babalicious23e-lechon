import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efktptoaamcnzrzadffn.supabase.co'
const supabaseKey = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCategoryInsert() {
    console.log("Testing INSERT on 'categories' table...");

    const newCategory = {
        name: `Test Category ${Date.now()}`,
        sort_order: 999
    };

    const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();

    if (error) {
        console.error("❌ INSERT Failed:", error.message);
        console.error("Full error:", error);
    } else {
        console.log("✅ INSERT Success!", data);

        // Cleanup
        await supabase.from('categories').delete().eq('id', data.id);
    }
}

testCategoryInsert();
