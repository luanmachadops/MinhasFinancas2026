
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing query...');
    const { data, error } = await supabase
        .from('shared_access')
        .select(`
            *,
            owner:owner_id (
                email,
                raw_user_meta_data
            )
        `)
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

testQuery();
