const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.qszasjzgthpdecrkadwm:Tamquan176%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  try {
    console.log('Connecting to Supabase (Session Pooler)...');
    await client.connect();
    console.log('Connected! Executing schema...');
    const sql = fs.readFileSync('d:/DuAnCaNhan/AppLichCaNhanHoa/supabase_schema.sql', 'utf8');
    await client.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}
run();
