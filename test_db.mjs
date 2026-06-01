import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data, error } = await supabase.from('schedules').select('*').limit(1);
  if (error) {
    console.error('Lỗi:', error);
  } else {
    console.log('Fields:', data && data.length > 0 ? Object.keys(data[0]) : 'No data');
  }
}
test();
