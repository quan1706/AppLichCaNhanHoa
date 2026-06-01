import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // Basic verification - this endpoint should be called by cron-job.org
    // Optional: Add authorization header check here

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, telegram_username, bot_token, bot_personality, schedule_config, notification_config');

    if (error) throw error;

    let actionsTaken: string[] = [];

    // Loop through profiles (currently only Quan)
    for (const profile of profiles || []) {
      const config = profile.notification_config || [];
      const schedule = profile.schedule_config || {};

      // Implement notification logic based on schedule and config here
      // Example: check if water reminder is ON, check if workout reminder is ON, etc.
      
      actionsTaken.push(`Checked notifications for ${profile.id}`);
    }

    return NextResponse.json({ ok: true, message: 'Cron job executed', actions: actionsTaken });
  } catch (error: any) {
    console.error('Error in notifications cron:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
