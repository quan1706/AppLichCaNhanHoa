import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const QUAN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const QUAN_UUID = '81552056-57ab-4cde-8f01-23456789abcd'; // Static UUID for Quan

// ----------------------------------------------------------------------
// CẤU HÌNH BÀN PHÍM
// ----------------------------------------------------------------------
const defaultKeyboard = {
  keyboard: [
    [{ text: '📅 Lịch hôm nay' }, { text: '⏰ Deadline hôm nay' }],
    [{ text: '🥗 Thực đơn hôm nay' }, { text: '📊 Tổng quan hôm nay' }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

// ----------------------------------------------------------------------
// HÀM GỬI TIN NHẮN TELEGRAM
// ----------------------------------------------------------------------
async function sendTelegramMessage(chatId: string, text: string, replyMarkup: any = defaultKeyboard) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });
    if (!res.ok) {
      console.error('Failed to send Telegram message:', await res.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

// ----------------------------------------------------------------------
// HELPER: LẤY GIỜ VIỆT NAM
// ----------------------------------------------------------------------
function getVietnamTimeInfo() {
  const now = new Date();
  const currentIctOffset = 7 * 60 * 60 * 1000;
  const vietnamTime = new Date(now.getTime() + currentIctOffset);
  const timeString = vietnamTime.toISOString();
  const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const currentDayName = dayOfWeekNames[vietnamTime.getUTCDay()];
  const todayStr = timeString.split('T')[0];
  const dayOfWeek = vietnamTime.getUTCDay(); // Sửa lỗi ở đây: Phải dùng getUTCDay thay vì getDay
  
  return { vietnamTime, timeString, currentDayName, todayStr, dayOfWeek };
}

// ----------------------------------------------------------------------
// API HANDLER MAIN
// ----------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('--- RECEIVED TELEGRAM WEBHOOK ---', JSON.stringify(body));

    // 0. Xử lý Nút Bấm (Callback Query) từ hệ thống nhắc nhở
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data; // e.g. "done_TASK-ID" or "doing_TASK-ID"
      const messageId = callbackQuery.message.message_id;
      const chatId = callbackQuery.message.chat.id;
      const callbackQueryId = callbackQuery.id;

      if (data.startsWith('done_') || data.startsWith('doing_')) {
        const action = data.split('_')[0]; // "done" or "doing"
        const taskId = data.split('_')[1];

        if (action === 'done') {
          await supabase.from('tasks').update({ is_done: true }).eq('id', taskId);
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: '✅ <b>Tốt lắm cưng!</b> Đã xác nhận hoàn thành. Cho nghỉ ngơi đấy! 💅',
              parse_mode: 'HTML',
            }),
          });
        } else if (action === 'doing') {
          const extraTime = new Date(Date.now() + 25 * 60 * 1000); 
          await supabase.from('tasks').update({ last_notified_at: extraTime.toISOString() }).eq('id', taskId);
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: '🏃‍♂️ <b>Đang chạy rồi à?</b> Tạm tha 30 phút nữa chị quay lại check! 💅',
              parse_mode: 'HTML',
            }),
          });
        }

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQueryId, text: 'Đã cập nhật!' }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(body.message.chat.id);
    const messageText = body.message.text.trim();

    // 1. Phân quyền
    if (chatId !== QUAN_CHAT_ID) {
      await sendTelegramMessage(chatId, `❌ <b>CẢNH BÁO XÂM NHẬP!</b>\n\nChị chỉ phục vụ đại ca <b>Nguyễn Tam Quân</b> thôi nhé! Xéo đi! 💅`, { remove_keyboard: true });
      return NextResponse.json({ ok: true });
    }

    // 2. Lấy thông tin thời gian
    const { vietnamTime, timeString, currentDayName, todayStr, dayOfWeek } = getVietnamTimeInfo();

    // ----------------------------------------------------------------------
    // LUỒNG 1: XỬ LÝ NHANH 4 NÚT BẤM (KHÔNG DÙNG AI ĐỂ TIẾT KIỆM TOKEN)
    // ----------------------------------------------------------------------
    if (messageText === '📅 Lịch hôm nay') {
      const { data: schedData } = await supabase.from('schedules').select('*').eq('profile_id', QUAN_UUID)
        .or(`specific_date.eq.${todayStr},days.cs.{${dayOfWeek}}`);
      const todaySchedules = (schedData || []).filter((s: any) => !s.specific_date || s.specific_date === todayStr)
        .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
      
      let msg = `🗓 <b>Lịch trình hôm nay (${todayStr}):</b>\n\n`;
      if (todaySchedules.length > 0) {
        todaySchedules.forEach((s: any) => {
          const timeStr = s.start_time.substring(0, 5) + (s.end_time ? ' - ' + s.end_time.substring(0, 5) : '');
          let icon = s.type === 'workout' ? '🏋️‍♂️' : (s.type === 'class' ? '📚' : '💻');
          msg += `${icon} <b>${timeStr}:</b> ${s.title}\n`;
        });
      } else {
        msg += `<i>Trống trơn! Rảnh rỗi thế? Tập thể dục đi! 💅</i>\n`;
      }
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }
    
    if (messageText === '⏰ Deadline hôm nay') {
      const startOfToday = new Date(vietnamTime); startOfToday.setUTCHours(0,0,0,0);
      const { data: deadlineData } = await supabase.from('deadlines').select('*').eq('user_id', QUAN_UUID)
        .eq('status', 'pending').gte('due_date', startOfToday.toISOString());
      
      let msg = `⏰ <b>Deadline chưa nộp:</b>\n\n`;
      if (deadlineData && deadlineData.length > 0) {
        deadlineData.forEach((d: any) => {
          const dueDate = new Date(d.due_date);
          const formattedDate = `${String(dueDate.getHours()).padStart(2,'0')}:${String(dueDate.getMinutes()).padStart(2,'0')} ${String(dueDate.getDate()).padStart(2,'0')}/${String(dueDate.getMonth()+1).padStart(2,'0')}`;
          msg += `⚠️ <b>${formattedDate}:</b> ${d.title}\n`;
        });
        msg += `\n<i>Lo mà làm đi, sắp toang rồi! 💅</i>`;
      } else {
        msg += `<i>Bình yên, không nợ môn nào. Ngủ ngon!</i>\n`;
      }
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    if (messageText === '🥗 Thực đơn hôm nay') {
      const { data: mealData } = await supabase.from('ai_fitness_plan').select('*').eq('date', todayStr).single();
      let msg = `🥗 <b>Thực đơn hôm nay (${todayStr}):</b>\n\n`;
      if (mealData) {
        msg += `🍳 Sáng: ${mealData.meal_breakfast || 'Chưa xếp'}\n`;
        msg += `🍱 Trưa: ${mealData.meal_lunch || 'Chưa xếp'}\n`;
        msg += `🥙 Xế: ${mealData.meal_snack || 'Chưa xếp'}\n`;
        msg += `🍲 Tối: ${mealData.meal_dinner || 'Chưa xếp'}\n`;
      } else {
        msg += `<i>Chưa có thực đơn cho hôm nay. Dùng lệnh /anuong để chị xếp cho nhé! 💅</i>\n`;
      }
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    if (messageText === '📊 Tổng quan hôm nay' || messageText.toLowerCase() === 'tổng quan hôm nay') {
      // (This uses the logic we built previously, simplified)
      const startOfToday = new Date(vietnamTime); startOfToday.setUTCHours(0,0,0,0);
      
      const { data: waterData } = await supabase.from('water_tracking').select('amount')
        .eq('user_id', QUAN_UUID).gte('created_at', startOfToday.toISOString()).lte('created_at', new Date(startOfToday.getTime() + 24*60*60*1000).toISOString());
      const totalWater = (waterData || []).reduce((sum, row) => sum + row.amount, 0);
      const waterPercent = Math.min(100, Math.round((totalWater / 3500) * 100));

      const { data: mealData } = await supabase.from('ai_fitness_plan').select('*').eq('date', todayStr).single();
      
      const { data: schedData } = await supabase.from('schedules').select('*').eq('profile_id', QUAN_UUID)
        .or(`specific_date.eq.${todayStr},days.cs.{${dayOfWeek}}`);
      const todaySchedules = (schedData || []).filter((s: any) => !s.specific_date || s.specific_date === todayStr)
        .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));

      const { data: deadlineData } = await supabase.from('deadlines').select('*').eq('user_id', QUAN_UUID)
        .eq('status', 'pending').gte('due_date', startOfToday.toISOString());

      let dashboardMsg = `<b>📊 BÁO CÁO TỔNG QUAN (${todayStr})</b>\n\n`;
      dashboardMsg += `💧 <b>Nước uống:</b> ${totalWater}ml / 3500ml (${waterPercent}%)\n\n`;
      
      dashboardMsg += `🥗 <b>Thực đơn:</b>\n`;
      if (mealData) {
        dashboardMsg += `Sáng: ${mealData.meal_breakfast || '-'}\nTrưa: ${mealData.meal_lunch || '-'}\nTối: ${mealData.meal_dinner || '-'}\n\n`;
      } else dashboardMsg += `<i>(Chưa lên)</i>\n\n`;

      dashboardMsg += `🗓 <b>Lịch trình:</b>\n`;
      if (todaySchedules.length > 0) {
        todaySchedules.forEach((s: any) => { dashboardMsg += `• ${s.start_time.substring(0,5)}: ${s.title}\n`; });
      } else dashboardMsg += `<i>(Trống)</i>\n`;
      dashboardMsg += '\n';

      dashboardMsg += `⏰ <b>Deadline:</b>\n`;
      if (deadlineData && deadlineData.length > 0) {
        dashboardMsg += `Còn ${deadlineData.length} deadline đang chờ nộp.\n`;
      } else dashboardMsg += `<i>(Trống)</i>\n`;

      await sendTelegramMessage(chatId, dashboardMsg);
      return NextResponse.json({ ok: true });
    }

    // ----------------------------------------------------------------------
    // LUỒNG 2: XỬ LÝ THEO LỆNH (COMMAND ROUTER) BẰNG AI GROQ
    // ----------------------------------------------------------------------
    
    // Nếu tin nhắn bắt đầu bằng /tuvan -> Agent Tư Vấn (Text Mode, No JSON)
    if (messageText.startsWith('/tuvan')) {
      const promptTuVan = `
Bạn là tamquan, một chuyên gia/PT tư vấn sức khỏe, tập luyện và giảm cân khắt khe.
Nhiệm vụ: Chỉ giải đáp các vấn đề về sức khỏe, tập luyện, calo.
NGHIÊM CẤM: Trả lời lan man các chủ đề khác (ví dụ code, lịch sử, toán học...). Nếu hỏi sai chủ đề, chửi và từ chối.
QUY TẮC: Trả lời CỰC KỲ NGẮN GỌN, tối đa 100 chữ, đi thẳng vào vấn đề để tiết kiệm token. Giọng điệu xéo xắt, gọi "Quân" hoặc "cưng".`;
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: promptTuVan },
          { role: 'user', content: messageText.replace('/tuvan', '').trim() },
        ],
        model: 'llama-3.3-70b-versatile',
      });
      const responseText = completion.choices[0]?.message?.content || 'Chị đang mệt, tí hỏi lại nha cưng.';
      await sendTelegramMessage(chatId, responseText);
      return NextResponse.json({ ok: true });
    }

    // Nếu tin nhắn bắt đầu bằng /lich -> Agent Lịch Trình (JSON Mode)
    if (messageText.startsWith('/lich')) {
      const promptLich = `
Bạn là tamquan, trợ lý đanh đá quản lý lịch trình.
Hiện tại là: ${timeString} (${currentDayName}).
Phân tích yêu cầu LỊCH TRÌNH của Quân (thêm/xóa) và trả về JSON chuẩn xác:
{
  "action": "add_schedule" hoặc "delete_schedule" hoặc "add_deadline",
  "data": {
     // Nếu add_schedule
     "title": "tên sự kiện",
     "event_type": "academic" | "work" | "social" | "fitness",
     "start_time": "ISO TIMESTAMP WITH TIMEZONE (ICT +07:00)",
     "end_time": "ISO TIMESTAMP WITH TIMEZONE (ICT +07:00)",
     
     // Nếu delete_schedule (xóa theo từ khóa tên)
     "title_keyword": "từ khóa tên sự kiện cần xóa",
     
     // Nếu add_deadline
     "title": "tên deadline",
     "due_date": "ISO TIMESTAMP WITH TIMEZONE (ICT +07:00)"
  },
  "response_message": "Câu chửi/khen xéo xắt xác nhận đã xử lý"
}`;
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: promptLich },
          { role: 'user', content: messageText.replace('/lich', '').trim() },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });
      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      // Xử lý Database
      if (aiResponse.action === 'add_schedule' && aiResponse.data?.title) {
        const d = aiResponse.data;
        const startDate = new Date(d.start_time);
        const endDate = d.end_time ? new Date(d.end_time) : new Date(startDate.getTime() + 60*60*1000);
        const startTime = `${String(startDate.getHours()).padStart(2,'0')}:${String(startDate.getMinutes()).padStart(2,'0')}:00`;
        const endTime = `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}:00`;
        
        let scheduleType = 'class';
        if (d.event_type === 'work') scheduleType = 'work';
        else if (d.event_type === 'fitness' || d.event_type === 'social') scheduleType = 'workout';
        
        await supabase.from('schedules').insert({
          profile_id: QUAN_UUID,
          title: d.title,
          type: scheduleType,
          days: [startDate.getDay()],
          start_time: startTime,
          end_time: endTime,
          shift: startDate.getHours() < 12 ? 'morning' : 'afternoon',
          specific_date: startDate.toISOString().split('T')[0]
        });
      } else if (aiResponse.action === 'delete_schedule' && aiResponse.data?.title_keyword) {
        await supabase.from('schedules').delete()
          .eq('profile_id', QUAN_UUID)
          .ilike('title', `%${aiResponse.data.title_keyword}%`);
      } else if (aiResponse.action === 'add_deadline' && aiResponse.data?.title) {
        await supabase.from('deadlines').insert({
          user_id: QUAN_UUID, title: aiResponse.data.title, due_date: aiResponse.data.due_date, status: 'pending'
        });
      }
      
      await sendTelegramMessage(chatId, aiResponse.response_message || 'Xong rồi cưng!');
      return NextResponse.json({ ok: true });
    }

    // Nếu tin nhắn bắt đầu bằng /anuong -> Agent Dinh Dưỡng (JSON Mode)
    if (messageText.startsWith('/anuong')) {
      const promptAnUong = `
Bạn là tamquan, chuyên gia dinh dưỡng đanh đá cho Quân (92kg).
Hiện tại là: ${timeString} (${currentDayName}).
Dựa vào yêu cầu, tạo hoặc điều chỉnh thực đơn MỚI cho hôm nay (${todayStr}) (luôn ưu tiên ức gà, khoai lang, chuối tiêu, ổi giòn, sữa chua).
Trả về JSON chuẩn xác:
{
  "action": "nutrition",
  "data": {
    "meal_breakfast": "món ăn (gram cụ thể)",
    "meal_lunch": "món ăn (gram cụ thể)",
    "meal_snack": "món ăn (gram cụ thể)",
    "meal_dinner": "món ăn (gram cụ thể)"
  },
  "response_message": "Câu chửi/khen xéo xắt xác nhận thực đơn"
}`;
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: promptAnUong },
          { role: 'user', content: messageText.replace('/anuong', '').trim() },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });
      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      // Xử lý Database Upsert
      if (aiResponse.action === 'nutrition' && aiResponse.data) {
        // Find existing to upsert or just upsert using Date as PK/Unique if it exists. 
        // We will query first:
        const { data: existingMeal } = await supabase.from('ai_fitness_plan').select('id').eq('date', todayStr).single();
        if (existingMeal) {
          await supabase.from('ai_fitness_plan').update({
            meal_breakfast: aiResponse.data.meal_breakfast,
            meal_lunch: aiResponse.data.meal_lunch,
            meal_snack: aiResponse.data.meal_snack,
            meal_dinner: aiResponse.data.meal_dinner
          }).eq('id', existingMeal.id);
        } else {
          await supabase.from('ai_fitness_plan').insert({
            date: todayStr,
            meal_breakfast: aiResponse.data.meal_breakfast,
            meal_lunch: aiResponse.data.meal_lunch,
            meal_snack: aiResponse.data.meal_snack,
            meal_dinner: aiResponse.data.meal_dinner,
            fitness_advice: 'Giữ kỷ luật tập luyện nhé!'
          });
        }
      }
      
      await sendTelegramMessage(chatId, aiResponse.response_message || 'Chị xếp xong thực đơn rồi, hốc ít thôi! 💅');
      return NextResponse.json({ ok: true });
    }

    // ----------------------------------------------------------------------
    // LUỒNG 3: FALLBACK TRỢ GIÚP (NẾU KHÔNG CÓ LỆNH)
    // ----------------------------------------------------------------------
    const fallbackMessage = `
Ê cưng! Muốn nhờ chị làm gì thì gõ đúng lệnh nha:
- Chỉnh lịch/deadline: <b>/lich [nội dung]</b>
- Xin thực đơn: <b>/anuong [nội dung]</b>
- Hỏi đáp gym/sức khỏe: <b>/tuvan [câu hỏi]</b>

<i>Hoặc là cưng bấm mấy cái nút bên dưới đi cho lẹ, đừng bắt chị đoán ý! 💅</i>
`;
    await sendTelegramMessage(chatId, fallbackMessage);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('CRITICAL ERROR IN WEBHOOK HANDLER:', error);
    return NextResponse.json({ ok: false, error: error.message });
  }
}
