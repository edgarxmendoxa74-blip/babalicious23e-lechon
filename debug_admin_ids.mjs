import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efktptoaamcnzrzadffn.supabase.co'
const supabaseKey = 'sb_publishable_OEppykDKBMMQn0pmZHA2XQ_VNb-SJfX'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testOrderTypeUpsert() {
    console.log("Testing UPSERT on 'order_types' with string ID...");

    // This mimics what AdminDashboard does for "Take Out"
    const orderType = {
        id: 'pickup',
        name: 'Take Out',
        is_active: true
    };

    const { data, error } = await supabase
        .from('order_types')
        .upsert(orderType)
        .select();

    if (error) {
        console.error("❌ OrderTypes UPSERT Failed:", error.message);
    } else {
        console.log("✅ OrderTypes UPSERT Success!", data);
    }
}

async function testPaymentMethodUpdate() {
    console.log("Testing UPDATE on 'payment_settings' with string ID...");

    // This mimics editing the default "GCash" method
    const { data, error } = await supabase
        .from('payment_settings')
        .update({ name: 'GCash Updated' })
        .eq('id', 'gcash')
        .select();

    if (error) {
        console.error("❌ Payment UPDATE Failed:", error.message);
    } else {
        console.log("✅ Payment UPDATE Success!", data);
    }
}

async function run() {
    await testOrderTypeUpsert();
    await testPaymentMethodUpdate();
}

run();
