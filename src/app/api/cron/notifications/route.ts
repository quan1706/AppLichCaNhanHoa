import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''; // Fallback

async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const body: any = { chat_id: chatId, text: text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error('Failed to send Telegram:', await res.text());
  } catch (error) {
    console.error('Error sending Telegram:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'default_secret_for_local_testing';
    
    if (authHeader !== `Bearer ${expectedSecret}` && searchParams.get('secret') !== expectedSecret) {
      // return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      // Bỏ comment dòng trên nếu muốn bảo mật cron-job
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;

    let actionsTaken: string[] = [];
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentHour = vietnamTime.getUTCHours();
    const currentMinutes = vietnamTime.getUTCMinutes();
    const todayStr = vietnamTime.toISOString().split('T')[0];
    const tomorrowStr = new Date(vietnamTime.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const profile of profiles || []) {
      const config = profile.notification_config || [];
      const waterConfig = config.find((c: any) => c.id === 'water');
      const deadlineConfig = config.find((c: any) => c.id === 'deadline');
      
      const targetChatId = profile.telegram_username ? CHAT_ID : CHAT_ID; // In a real app, resolve username to Chat ID, here we use fallback.

      // --- 1. WATER REMINDER ---
      if (waterConfig?.on && currentHour >= 8 && currentHour <= 22) {
        const weight = profile.current_weight || 92;
        const dailyWaterGoal = profile.water_goal || Math.round(weight * 40);
        const elapsedMinutes = ((currentHour - 8) * 60) + currentMinutes;
        const expectedWaterIntake = Math.round((dailyWaterGoal / 840) * elapsedMinutes);

        const startOfToday = new Date(vietnamTime);
        startOfToday.setUTCHours(0,0,0,0);
        
        const { data: waterData } = await supabase
          .from('water_tracking')
          .select('amount')
          .eq('user_id', profile.id)
          .gte('consumed_at', startOfToday.toISOString());
        
        const totalWater = (waterData || []).reduce((sum, row) => sum + row.amount, 0);

        if (totalWater < expectedWaterIntake - 250) {
          const remaining = dailyWaterGoal - totalWater;
          await sendTelegramMessage(targetChatId, `🥤 <b>Ê CƯNG! UỐNG NƯỚC!</b>\n\nThiếu nước kìa! Mới uống được ${totalWater}ml. Mục tiêu ${dailyWaterGoal}ml.\nCòn thiếu tận ${remaining}ml nữa. Đứng dậy nốc nước ngay! 💅`);
          actionsTaken.push(`Sent water reminder to ${profile.id}`);
        }
      }

      // --- 2. DEADLINE ALERTS (SPAM EVERY 5 MINS) ---
      if (deadlineConfig?.on) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('is_done', false);
        
        for (const t of tasks || []) {
          if (!t.deadline) continue;
          const dueTime = new Date(t.deadline).getTime();
          const timeDiff = dueTime - vietnamTime.getTime();
          const hoursLeft = timeDiff / (1000 * 60 * 60);

          if (hoursLeft > 0 && hoursLeft <= 1) { // Dưới 1 tiếng
            const lastNotified = t.last_notified_at ? new Date(t.last_notified_at).getTime() : 0;
            const minsSinceLastNotify = (vietnamTime.getTime() - lastNotified) / (1000 * 60);
            
            // Nếu chưa nhắc hoặc đã nhắc quá 5 phút trước
            if (minsSinceLastNotify >= 5) {
              const keyboard = {
                inline_keyboard: [[
                  { text: "✅ Đã làm xong", callback_data: `done_${t.id}` },
                  { text: "🏃‍♂️ Đang làm", callback_data: `doing_${t.id}` }
                ]]
              };
              await sendTelegramMessage(targetChatId, `🚨 <b>BÁO ĐỘNG ĐỎ! DEADLINE CÒN DƯỚI 1 TIẾNG!</b>\n\nMôn/Bài: ${t.title}\nCòn ngồi chơi được à? Cắm mặt vào chạy ngay cho chị!!! 💅`, keyboard);
              
              // Cập nhật lại thời gian đã nhắc
              await supabase.from('tasks').update({ last_notified_at: vietnamTime.toISOString() }).eq('id', t.id);
              actionsTaken.push(`Sent 1h deadline alert for ${t.title}`);
            }
          }
        }
      }

      // --- 3. EVENT REMINDERS (1 DAY BEFORE) ---
      // Lấy lịch sự kiện cá nhân (user_schedule) có needs_reminder = true
      const { data: events } = await supabase
        .from('user_schedule')
        .select('*')
        .eq('needs_reminder', true)
        .eq('date', tomorrowStr); // Diễn ra vào ngày mai
      
      for (const ev of events || []) {
        // Chỉ nhắc 1 lần lúc 9h sáng hôm trước
        if (currentHour === 9 && currentMinutes < 5) {
          await sendTelegramMessage(targetChatId, `📅 <b>NHẮC LỊCH MAI ĐI CHƠI/SỰ KIỆN NÈ:</b>\n\n- Tên: ${ev.title}\n- Ngày: ${ev.date}\n- Giờ: ${ev.start_time} - ${ev.end_time}\n\nChuẩn bị lộng lẫy lên nha cưng! 💅`);
          actionsTaken.push(`Sent event reminder for ${ev.title}`);
        }
      }
    }

    return NextResponse.json({ ok: true, time: vietnamTime.toISOString(), actions: actionsTaken });
  } catch (error: any) {
    console.error('CRITICAL ERROR IN CRON:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
