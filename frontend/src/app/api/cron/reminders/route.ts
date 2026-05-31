import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const QUAN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const QUAN_UUID = '81552056-57ab-4cde-8f01-23456789abcd'; // Static UUID for Quan

async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
    });
    if (!res.ok) console.error('Failed to send Telegram message:', await res.text());
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

export async function GET(request: Request) {
  try {
    // Basic authorization for the cron job (Optional but recommended)
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'default_secret_for_local_testing';
    
    // Allow either Bearer token or query param `?secret=...`
    if (
      authHeader !== `Bearer ${expectedSecret}` &&
      searchParams.get('secret') !== expectedSecret
    ) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time in Vietnam (ICT)
    const now = new Date();
    const currentIctOffset = 7 * 60 * 60 * 1000;
    const vietnamTime = new Date(now.getTime() + currentIctOffset);
    const currentHour = vietnamTime.getUTCHours();
    const currentMinutes = vietnamTime.getUTCMinutes();
    const todayStr = vietnamTime.toISOString().split('T')[0];

    let actionsTaken: string[] = [];

    // --- 1. WATER REMINDER LOGIC ---
    // Only remind if time is between 08:00 and 22:00
    if (currentHour >= 8 && currentHour <= 22) {
      // Get Quan's Profile (weight)
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_weight, daily_water_goal')
        .eq('id', QUAN_UUID)
        .single();
      
      const weight = profile?.current_weight || 92;
      const dailyWaterGoal = profile?.daily_water_goal || Math.round(weight * 40); // Standard rule of thumb: ~40ml / kg
      
      // Calculate how much water Quan SHOULD have drank by now
      // Assuming 14 hours of drinking time (8:00 to 22:00) -> 14 hours = 840 minutes
      const elapsedMinutes = ((currentHour - 8) * 60) + currentMinutes;
      const expectedWaterIntake = Math.round((dailyWaterGoal / 840) * elapsedMinutes);

      // Get how much water actually consumed today
      const startOfToday = new Date(vietnamTime);
      startOfToday.setUTCHours(0,0,0,0);
      const { data: waterData } = await supabase
        .from('water_tracking')
        .select('amount')
        .eq('user_id', QUAN_UUID)
        .gte('created_at', startOfToday.toISOString())
        .lte('created_at', new Date(startOfToday.getTime() + 24*60*60*1000).toISOString());
      
      const totalWater = (waterData || []).reduce((sum, row) => sum + row.amount, 0);

      // Remind every ~30 mins if deficit is high.
      // E.g., if he is behind by > 250ml
      if (totalWater < expectedWaterIntake - 250) {
        const remaining = dailyWaterGoal - totalWater;
        await sendTelegramMessage(QUAN_CHAT_ID, `🥤 <b>Ê CƯNG! UỐNG NƯỚC!</b>\n\nTính theo cân nặng ${weight}kg thì hôm nay phải nốc ${dailyWaterGoal}ml.\nBây giờ là ${currentHour}:${String(currentMinutes).padStart(2,'0')} mà mới uống có ${totalWater}ml (Đáng lẽ phải được ${expectedWaterIntake}ml rồi).\n\nCòn thiếu tận ${remaining}ml nữa. Đứng dậy lấy nước ngay không chị phạt hít đất 50 cái bây giờ! 💅`);
        actionsTaken.push('Sent water reminder');
      }
    }

    // --- 2. DEADLINE ALERTS LOGIC ---
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', QUAN_UUID)
      .eq('status', 'pending');

    if (deadlines && deadlines.length > 0) {
      for (const d of deadlines) {
        const dueTime = new Date(d.due_date).getTime();
        const timeDiff = dueTime - vietnamTime.getTime();
        const hoursLeft = timeDiff / (1000 * 60 * 60);

        if (hoursLeft > 0 && hoursLeft <= 24 && hoursLeft > 23) {
          // Alert 24h before
          await sendTelegramMessage(QUAN_CHAT_ID, `⚠️ <b>BÁO ĐỘNG DEADLINE (CÒN 24H)</b>\n\nMôn/Bài: ${d.title}\nHạn chót: ${new Date(d.due_date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\nLàm bài đi đừng để nước đến chân mới nhảy! 💅`);
          actionsTaken.push(`Sent 24h deadline alert for ${d.title}`);
        } else if (hoursLeft > 0 && hoursLeft <= 1) {
          // Alert < 1h (If cron runs frequently, we don't want to spam 60 times. Let's assume we flag this somehow, or just send it if it's strictly within the last hour window)
          await sendTelegramMessage(QUAN_CHAT_ID, `🚨 <b>BÁO ĐỘNG ĐỎ! DEADLINE CÒN DƯỚI 1 TIẾNG!</b>\n\nMôn/Bài: ${d.title}\nHạn chót: ${new Date(d.due_date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\nCòn ngồi chơi được à? Cắm mặt vào chạy ngay cho chị!!! 💅`);
          actionsTaken.push(`Sent 1h deadline alert for ${d.title}`);
        } else if (hoursLeft < 0) {
          // Already late
          // Could send an insult, but don't spam if they haven't marked it done.
        }
      }
    }

    return NextResponse.json({ ok: true, time: vietnamTime.toISOString(), actions: actionsTaken });
  } catch (error: any) {
    console.error('CRITICAL ERROR IN CRON:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
