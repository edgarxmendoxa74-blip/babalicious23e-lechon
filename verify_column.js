import { supabase } from './src/supabaseClient.js';

async function checkColumn() {
    console.log("Checking if 'out_of_stock' column exists...");

    // Try to select the column specifically
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, out_of_stock')
        .limit(1);

    if (error) {
        console.error("❌ Error accessing column:", error.message);
        console.error("Full error:", error);
    } else {
        console.log("✅ Success! Column exists and is accessible via API.");
        console.log("Sample data:", data);
    }
}

checkColumn();
