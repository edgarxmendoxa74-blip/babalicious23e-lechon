import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jczgbhgqxjyiqfrraknl.supabase.co';
const supabaseAnonKey = 'sb_publishable_ydOoWVMtMfZpORex41rxcw_vcBjcNNU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
